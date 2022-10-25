NODE_PACKAGE_MANAGER = pnpm

clean:
	rm -rf node_modules \
	apps/web/node_modules apps/web/.turbo apps/web/.next \
	packages/eslint-custom-config/node_modules \
	packages/models/node_modules packages/models/.turbo \
	packages/ui/node_modules packages/ui/.turbo

install:
	$(NODE_PACKAGE_MANAGER) install

dev:
	$(NODE_PACKAGE_MANAGER) dev

build:
	$(NODE_PACKAGE_MANAGER) build

format:
	$(NODE_PACKAGE_MANAGER) format

format-check:
	$(NODE_PACKAGE_MANAGER) format-check
