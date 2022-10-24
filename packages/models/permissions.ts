export type permission = serviceAdminPermission | householdAdminPermission | serviceUserPermission;

export const enum serviceAdminPermission {
  UPDATE_COOKIE_SECRET = 'update.cookie_secret',
  UPDATE_USER_STATUS = 'update.user_status',
  READ_USER = 'read.user',
  SEARCH_USERS = 'search.user',

  CREATE_VALID_INSTRUMENTS = 'create.valid_instruments',
  UPDATE_VALID_INSTRUMENTS = 'update.valid_instruments',
  ARCHIVE_VALID_INSTRUMENTS = 'archive.valid_instruments',

  CREATE_VALID_INGREDIENTS = 'create.valid_ingredients',
  UPDATE_VALID_INGREDIENTS = 'update.valid_ingredients',
  ARCHIVE_VALID_INGREDIENTS = 'archive.valid_ingredients',

  CREATE_VALID_PREPARATIONS = 'create.valid_preparations',
  UPDATE_VALID_PREPARATIONS = 'update.valid_preparations',
  ARCHIVE_VALID_PREPARATIONS = 'archive.valid_preparations',

  CREATE_VALID_INGREDIENT_PREPARATIONS = 'create.valid_ingredient_preparations',
  UPDATE_VALID_INGREDIENT_PREPARATIONS = 'update.valid_ingredient_preparations',
  ARCHIVE_VALID_INGREDIENT_PREPARATIONS = 'archive.valid_ingredient_preparations',
}

export const enum householdAdminPermission {
  UPDATE_HOUSEHOLD = 'update.household',
  ARCHIVE_HOUSEHOLD = 'archive.household',
  TRANSFER_HOUSEHOLD_OWNERSHIP = 'transfer.household',

  INVITE_MEMBER_TO_HOUSEHOLD = 'household.add.member',
  MODIFY_HOUSEHOLD_MEMBERSHIPS = 'household.membership.modify',
  REMOVE_MEMBER_FROM_HOUSEHOLD = 'remove_member.household',

  CREATE_WEBHOOKS = 'create.webhooks',
  UPDATE_WEBHOOKS = 'update.webhooks',
  ARCHIVE_WEBHOOKS = 'archive.webhooks',

  CREATE_MEAL_PLANS = 'create.meal_plans',
  UPDATES_MEAL_PLANS = 'update.meal_plans',
  ARCHIVE_MEAL_PLANS = 'archive.meal_plans',

  CREATE_MEAL_PLAN_OPTIONS = 'create.meal_plan_options',
  UPDATES_MEAL_PLAN_OPTIONS = 'update.meal_plan_options',
  ARCHIVE_MEAL_PLAN_OPTIONS = 'archive.meal_plan_options',
}

export const enum serviceUserPermission {
  READ_WEBHOOKS = 'read.webhooks',

  CREATE_API_CLIENTS = 'create.api_clients',
  READ_API_CLIENTS = 'read.api_clients',
  ARCHIVE_API_CLIENTS = 'archive.api_clients',

  CREATE_MEALS = 'create.meals',
  READ_MEALS = 'read.meals',
  UPDATE_MEALS = 'updates.meals',
  ARCHIVE_MEALS = 'archive.meals',

  CREATE_RECIPES = 'create.recipes',
  READ_RECIPES = 'read.recipes',
  SEARCH_RECIPES = 'search.recipes',
  UPDATE_RECIPES = 'updates.recipes',
  ARCHIVE_RECIPES = 'archive.recipes',

  CREATE_RECIPE_STEPS = 'create.recipe_steps',
  READ_RECIPE_STEPS = 'read.recipe_steps',
  SEARCH_RECIPE_STEPS = 'search.recipe_steps',
  UPDATE_RECIPE_STEPS = 'updates.recipe_steps',
  ARCHIVE_RECIPE_STEPS = 'archive.recipe_steps',

  CREATE_RECIPE_STEP_INSTRUMENTS = 'create.recipe_step_instruments',
  READ_RECIPE_STEP_INSTRUMENTS = 'read.recipe_step_instruments',
  SEARCH_RECIPE_STEP_INSTRUMENTS = 'search.recipe_step_instruments',
  UPDATE_RECIPE_STEP_INSTRUMENTS = 'updates.recipe_step_instruments',
  ARCHIVE_RECIPE_STEP_INSTRUMENTS = 'archive.recipe_step_instruments',

  CREATE_RECIPE_STEP_INGREDIENTS = 'create.recipe_step_ingredients',
  READ_RECIPE_STEP_INGREDIENTS = 'read.recipe_step_ingredients',
  SEARCH_RECIPE_STEP_INGREDIENTS = 'search.recipe_step_ingredients',
  UPDATE_RECIPE_STEP_INGREDIENTS = 'updates.recipe_step_ingredients',
  ARCHIVE_RECIPE_STEP_INGREDIENTS = 'archive.recipe_step_ingredients',

  CREATE_RECIPE_STEP_PRODUCTS = 'create.recipe_step_products',
  READ_RECIPE_STEP_PRODUCTS = 'read.recipe_step_products',
  SEARCH_RECIPE_STEP_PRODUCTS = 'search.recipe_step_products',
  UPDATE_RECIPE_STEP_PRODUCTS = 'updates.recipe_step_products',
  ARCHIVE_RECIPE_STEP_PRODUCTS = 'archive.recipe_step_products',

  READ_VALID_INSTRUMENTS = 'read.valid_instruments',
  SEARCH_VALID_INSTRUMENTS = 'search.valid_instruments',

  READ_VALID_INGREDIENTS = 'read.valid_ingredients',
  SEARCH_VALID_INGREDIENTS = 'search.valid_ingredients',

  READ_VALID_PREPARATIONS = 'read.valid_preparations',
  SEARCH_VALID_PREPARATIONS = 'search.valid_preparations',

  READ_VALID_INGREDIENT_PREPARATIONS = 'read.valid_ingredient_preparations',
  SEARCH_VALID_INGREDIENT_PREPARATIONS = 'search.valid_ingredient_preparations',

  READ_MEAL_PLANS = 'read.meal_plans',
  SEARCH_MEAL_PLANS = 'search.meal_plans',

  READ_MEAL_PLAN_OPTIONS = 'read.meal_plan_options',
  SEARCH_MEAL_PLAN_OPTIONS = 'search.meal_plan_options',

  CREATE_MEAL_PLAN_OPTION_VOTES = 'create.meal_plan_option_votes',
  READ_MEAL_PLAN_OPTION_VOTES = 'read.meal_plan_option_votes',
  SEARCH_MEAL_PLAN_OPTION_VOTES = 'search.meal_plan_option_votes',
  UPDATE_MEAL_PLAN_OPTION_VOTES = 'updates.meal_plan_option_votes',
  ARCHIVE_MEAL_PLAN_OPTION_VOTES = 'archive.meal_plan_option_votes',
}
