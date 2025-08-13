# OmegaOne Proxy Manager - Build System
# Generates CRX files using Docker for cross-platform compatibility

EXTENSION_NAME := omegaone-proxy-manager
VERSION := $(shell grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
BUILD_DIR := build
DIST_DIR := dist
DOCKER_IMAGE := timbru31/node-chrome:latest
KEY_FILE := $(BUILD_DIR)/extension.pem
CRX_FILE := $(DIST_DIR)/$(EXTENSION_NAME)-$(VERSION).crx
ZIP_FILE := $(DIST_DIR)/$(EXTENSION_NAME)-$(VERSION).zip

# Default target
.PHONY: all
all: crx

# Create necessary directories
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(DIST_DIR):
	mkdir -p $(DIST_DIR)

# Pull Docker image for CRX generation
.PHONY: docker-pull
docker-pull:
	@echo "Pulling Docker image for CRX generation..."
	docker pull $(DOCKER_IMAGE)

# Generate private key for signing
$(KEY_FILE): $(BUILD_DIR)
	@echo "Generating private key for extension signing..."
	@if command -v openssl >/dev/null 2>&1; then \
		openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out $(KEY_FILE); \
	else \
		docker run --rm \
			-v $(PWD)/$(BUILD_DIR):/build \
			$(DOCKER_IMAGE) \
			openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out /build/extension.pem; \
	fi

# Clean build artifacts but keep the key
.PHONY: clean
clean:
	rm -rf $(DIST_DIR)
	rm -f $(BUILD_DIR)/*.crx $(BUILD_DIR)/*.zip

# Clean everything including the private key
.PHONY: clean-all
clean-all:
	rm -rf $(BUILD_DIR) $(DIST_DIR)

# Generate CRX file (fallback to ZIP if CRX generation fails)
.PHONY: crx
crx: $(KEY_FILE) $(DIST_DIR)
	@echo "Generating CRX file..."
	@if command -v npm >/dev/null 2>&1 && command -v zip >/dev/null 2>&1; then \
		echo "Using local Node.js/npm..."; \
		npm install --no-save crx3 > /dev/null 2>&1; \
		node build-crx.js . $(KEY_FILE) $(CRX_FILE) || \
		(echo "CRX generation failed, creating ZIP package instead..." && $(MAKE) zip); \
	else \
		echo "Using Docker..."; \
		$(MAKE) docker-pull; \
		docker run --rm \
			-v $(PWD):/workspace \
			-w /workspace \
			$(DOCKER_IMAGE) \
			sh -c "npm install crx3 && node build-crx.js /workspace $(KEY_FILE) $(CRX_FILE)"; \
	fi

# Generate ZIP file (alternative distribution format)
.PHONY: zip
zip: $(DIST_DIR)
	@echo "Creating ZIP package..."
	zip -r $(ZIP_FILE) . \
		-x "*.git*" \
		-x "node_modules/*" \
		-x "$(BUILD_DIR)/*" \
		-x "$(DIST_DIR)/*" \
		-x "docker/*" \
		-x "Makefile" \
		-x "*.md" \
		-x "create-*.js" \
		-x "generate-*.js"

# Package both CRX and ZIP
.PHONY: package
package: crx zip
	@echo "Extension packaged successfully!"
	@echo "CRX file: $(CRX_FILE)"
	@echo "ZIP file: $(ZIP_FILE)"
	@ls -la $(DIST_DIR)/

# Install extension in Chrome/Chromium (requires local installation)
.PHONY: install-dev
install-dev:
	@echo "Opening Chrome extensions page..."
	@echo "Please enable Developer Mode and click 'Load unpacked' to select this directory"
	@if command -v google-chrome >/dev/null 2>&1; then \
		google-chrome chrome://extensions/; \
	elif command -v chromium >/dev/null 2>&1; then \
		chromium chrome://extensions/; \
	elif command -v brave >/dev/null 2>&1; then \
		brave brave://extensions/; \
	else \
		echo "No supported browser found. Please manually open chrome://extensions/ or brave://extensions/"; \
	fi

# Show build information
.PHONY: info
info:
	@echo "Extension Name: $(EXTENSION_NAME)"
	@echo "Version: $(VERSION)"
	@echo "Build Directory: $(BUILD_DIR)"
	@echo "Distribution Directory: $(DIST_DIR)"
	@echo "Key File: $(KEY_FILE)"
	@echo "CRX File: $(CRX_FILE)"
	@echo "ZIP File: $(ZIP_FILE)"

# Validate extension files
.PHONY: validate
validate:
	@echo "Validating extension files..."
	@docker run --rm \
		-v $(PWD):/workspace \
		-w /workspace \
		$(DOCKER_IMAGE) \
		node -e "console.log('manifest.json:', JSON.parse(require('fs').readFileSync('manifest.json', 'utf8')).name)"
	@echo "Validation complete"

# Help target
.PHONY: help
help:
	@echo "OmegaOne Proxy Manager Build System"
	@echo ""
	@echo "Available targets:"
	@echo "  all          - Build CRX file (default)"
	@echo "  crx          - Generate CRX file using Docker"
	@echo "  zip          - Generate ZIP package"
	@echo "  package      - Generate both CRX and ZIP files"
	@echo "  docker-pull  - Pull Docker image for CRX generation"
	@echo "  clean        - Clean build artifacts (keep private key)"
	@echo "  clean-all    - Clean everything including private key"
	@echo "  install-dev  - Open browser extensions page for manual installation"
	@echo "  validate     - Validate extension files"
	@echo "  info         - Show build information"
	@echo "  help         - Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make crx           # Generate CRX file"
	@echo "  make package       # Generate both CRX and ZIP"
	@echo "  make clean && make # Clean rebuild"