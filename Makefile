NODE_PACKAGE_MANAGER = pnpm

clean:
	rm -rf node_modules \
	apps/admin/node_modules apps/admin/.turbo apps/admin/.next \
	apps/web/node_modules apps/web/.turbo apps/web/.next \
	packages/eslint-custom-config/node_modules \
	packages/models/node_modules packages/models/.turbo \
	packages/ui/node_modules packages/ui/.turbo

install:
	$(NODE_PACKAGE_MANAGER) install

dev:
	$(NODE_PACKAGE_MANAGER) dev
