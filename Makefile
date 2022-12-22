NODE_PACKAGE_MANAGER = yarn

clean:
	rm -rf node_modules \
	apps/web/node_modules apps/web/.turbo apps/web/.next \
	packages/eslint-custom-config/node_modules \
	packages/models/node_modules packages/models/.turbo \
	packages/ui/node_modules packages/ui/.turbo

.PHONY: install
install:
	$(NODE_PACKAGE_MANAGER) install

.PHONY: lint
lint:
	$(NODE_PACKAGE_MANAGER) lint

.PHONY: dev
dev:
	$(NODE_PACKAGE_MANAGER) dev

.PHONY: build
build:
	$(NODE_PACKAGE_MANAGER) build

.PHONY: test
test:
	$(NODE_PACKAGE_MANAGER) test

.PHONY: format
format:
	$(NODE_PACKAGE_MANAGER) format

.PHONY: format-check
format-check:
	$(NODE_PACKAGE_MANAGER) format-check

.PHONY: terraformat
terraformat:
	@(cd environments/webapp/dev/terraform && terraform fmt)
	@(cd environments/admin/dev/terraform && terraform fmt)
