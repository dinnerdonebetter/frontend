// Code generated by gen_typescript. DO NOT EDIT.

export interface IValidIngredient {
  createdAt: NonNullable<string>;
  lastUpdatedAt?: string;
  archivedAt?: string;
  maximumIdealStorageTemperatureInCelsius?: number;
  minimumIdealStorageTemperatureInCelsius?: number;
  iconPath: NonNullable<string>;
  warning: NonNullable<string>;
  pluralName: NonNullable<string>;
  storageInstructions: NonNullable<string>;
  name: NonNullable<string>;
  id: NonNullable<string>;
  description: NonNullable<string>;
  slug: NonNullable<string>;
  shoppingSuggestions: NonNullable<string>;
  containsShellfish: NonNullable<boolean>;
  isMeasuredVolumetrically: NonNullable<boolean>;
  isLiquid: NonNullable<boolean>;
  containsPeanut: NonNullable<boolean>;
  containsTreeNut: NonNullable<boolean>;
  containsEgg: NonNullable<boolean>;
  containsWheat: NonNullable<boolean>;
  containsSoy: NonNullable<boolean>;
  animalDerived: NonNullable<boolean>;
  restrictToPreparations: NonNullable<boolean>;
  containsSesame: NonNullable<boolean>;
  containsFish: NonNullable<boolean>;
  containsGluten: NonNullable<boolean>;
  containsDairy: NonNullable<boolean>;
  containsAlcohol: NonNullable<boolean>;
  animalFlesh: NonNullable<boolean>;
}

export class ValidIngredient implements IValidIngredient {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  lastUpdatedAt?: string;
  archivedAt?: string;
  maximumIdealStorageTemperatureInCelsius?: number;
  minimumIdealStorageTemperatureInCelsius?: number;
  iconPath: NonNullable<string> = '';
  warning: NonNullable<string> = '';
  pluralName: NonNullable<string> = '';
  storageInstructions: NonNullable<string> = '';
  name: NonNullable<string> = '';
  id: NonNullable<string> = '';
  description: NonNullable<string> = '';
  slug: NonNullable<string> = '';
  shoppingSuggestions: NonNullable<string> = '';
  containsShellfish: NonNullable<boolean> = false;
  isMeasuredVolumetrically: NonNullable<boolean> = false;
  isLiquid: NonNullable<boolean> = false;
  containsPeanut: NonNullable<boolean> = false;
  containsTreeNut: NonNullable<boolean> = false;
  containsEgg: NonNullable<boolean> = false;
  containsWheat: NonNullable<boolean> = false;
  containsSoy: NonNullable<boolean> = false;
  animalDerived: NonNullable<boolean> = false;
  restrictToPreparations: NonNullable<boolean> = false;
  containsSesame: NonNullable<boolean> = false;
  containsFish: NonNullable<boolean> = false;
  containsGluten: NonNullable<boolean> = false;
  containsDairy: NonNullable<boolean> = false;
  containsAlcohol: NonNullable<boolean> = false;
  animalFlesh: NonNullable<boolean> = false;

  constructor(
    input: {
      createdAt?: string;
      lastUpdatedAt?: string;
      archivedAt?: string;
      maximumIdealStorageTemperatureInCelsius?: number;
      minimumIdealStorageTemperatureInCelsius?: number;
      iconPath?: string;
      warning?: string;
      pluralName?: string;
      storageInstructions?: string;
      name?: string;
      id?: string;
      description?: string;
      slug?: string;
      shoppingSuggestions?: string;
      containsShellfish?: boolean;
      isMeasuredVolumetrically?: boolean;
      isLiquid?: boolean;
      containsPeanut?: boolean;
      containsTreeNut?: boolean;
      containsEgg?: boolean;
      containsWheat?: boolean;
      containsSoy?: boolean;
      animalDerived?: boolean;
      restrictToPreparations?: boolean;
      containsSesame?: boolean;
      containsFish?: boolean;
      containsGluten?: boolean;
      containsDairy?: boolean;
      containsAlcohol?: boolean;
      animalFlesh?: boolean;
    } = {},
  ) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.maximumIdealStorageTemperatureInCelsius = input.maximumIdealStorageTemperatureInCelsius;
    this.minimumIdealStorageTemperatureInCelsius = input.minimumIdealStorageTemperatureInCelsius;
    this.iconPath = input.iconPath ?? '';
    this.warning = input.warning ?? '';
    this.pluralName = input.pluralName ?? '';
    this.storageInstructions = input.storageInstructions ?? '';
    this.name = input.name ?? '';
    this.id = input.id ?? '';
    this.description = input.description ?? '';
    this.slug = input.slug ?? '';
    this.shoppingSuggestions = input.shoppingSuggestions ?? '';
    this.containsShellfish = input.containsShellfish ?? false;
    this.isMeasuredVolumetrically = input.isMeasuredVolumetrically ?? false;
    this.isLiquid = input.isLiquid ?? false;
    this.containsPeanut = input.containsPeanut ?? false;
    this.containsTreeNut = input.containsTreeNut ?? false;
    this.containsEgg = input.containsEgg ?? false;
    this.containsWheat = input.containsWheat ?? false;
    this.containsSoy = input.containsSoy ?? false;
    this.animalDerived = input.animalDerived ?? false;
    this.restrictToPreparations = input.restrictToPreparations ?? false;
    this.containsSesame = input.containsSesame ?? false;
    this.containsFish = input.containsFish ?? false;
    this.containsGluten = input.containsGluten ?? false;
    this.containsDairy = input.containsDairy ?? false;
    this.containsAlcohol = input.containsAlcohol ?? false;
    this.animalFlesh = input.animalFlesh ?? false;
  }
}

export interface IValidIngredientCreationRequestInput {
  minimumIdealStorageTemperatureInCelsius?: number;
  maximumIdealStorageTemperatureInCelsius?: number;
  warning: NonNullable<string>;
  iconPath: NonNullable<string>;
  pluralName: NonNullable<string>;
  storageInstructions: NonNullable<string>;
  name: NonNullable<string>;
  description: NonNullable<string>;
  slug: NonNullable<string>;
  shoppingSuggestions: NonNullable<string>;
  isMeasuredVolumetrically: NonNullable<boolean>;
  containsFish: NonNullable<boolean>;
  containsShellfish: NonNullable<boolean>;
  animalFlesh: NonNullable<boolean>;
  containsEgg: NonNullable<boolean>;
  isLiquid: NonNullable<boolean>;
  containsSoy: NonNullable<boolean>;
  containsPeanut: NonNullable<boolean>;
  animalDerived: NonNullable<boolean>;
  restrictToPreparations: NonNullable<boolean>;
  containsDairy: NonNullable<boolean>;
  containsSesame: NonNullable<boolean>;
  containsTreeNut: NonNullable<boolean>;
  containsWheat: NonNullable<boolean>;
  containsAlcohol: NonNullable<boolean>;
  containsGluten: NonNullable<boolean>;
}

export class ValidIngredientCreationRequestInput implements IValidIngredientCreationRequestInput {
  minimumIdealStorageTemperatureInCelsius?: number;
  maximumIdealStorageTemperatureInCelsius?: number;
  warning: NonNullable<string> = '';
  iconPath: NonNullable<string> = '';
  pluralName: NonNullable<string> = '';
  storageInstructions: NonNullable<string> = '';
  name: NonNullable<string> = '';
  description: NonNullable<string> = '';
  slug: NonNullable<string> = '';
  shoppingSuggestions: NonNullable<string> = '';
  isMeasuredVolumetrically: NonNullable<boolean> = false;
  containsFish: NonNullable<boolean> = false;
  containsShellfish: NonNullable<boolean> = false;
  animalFlesh: NonNullable<boolean> = false;
  containsEgg: NonNullable<boolean> = false;
  isLiquid: NonNullable<boolean> = false;
  containsSoy: NonNullable<boolean> = false;
  containsPeanut: NonNullable<boolean> = false;
  animalDerived: NonNullable<boolean> = false;
  restrictToPreparations: NonNullable<boolean> = false;
  containsDairy: NonNullable<boolean> = false;
  containsSesame: NonNullable<boolean> = false;
  containsTreeNut: NonNullable<boolean> = false;
  containsWheat: NonNullable<boolean> = false;
  containsAlcohol: NonNullable<boolean> = false;
  containsGluten: NonNullable<boolean> = false;

  constructor(
    input: {
      minimumIdealStorageTemperatureInCelsius?: number;
      maximumIdealStorageTemperatureInCelsius?: number;
      warning?: string;
      iconPath?: string;
      pluralName?: string;
      storageInstructions?: string;
      name?: string;
      description?: string;
      slug?: string;
      shoppingSuggestions?: string;
      isMeasuredVolumetrically?: boolean;
      containsFish?: boolean;
      containsShellfish?: boolean;
      animalFlesh?: boolean;
      containsEgg?: boolean;
      isLiquid?: boolean;
      containsSoy?: boolean;
      containsPeanut?: boolean;
      animalDerived?: boolean;
      restrictToPreparations?: boolean;
      containsDairy?: boolean;
      containsSesame?: boolean;
      containsTreeNut?: boolean;
      containsWheat?: boolean;
      containsAlcohol?: boolean;
      containsGluten?: boolean;
    } = {},
  ) {
    this.minimumIdealStorageTemperatureInCelsius = input.minimumIdealStorageTemperatureInCelsius;
    this.maximumIdealStorageTemperatureInCelsius = input.maximumIdealStorageTemperatureInCelsius;
    this.warning = input.warning ?? '';
    this.iconPath = input.iconPath ?? '';
    this.pluralName = input.pluralName ?? '';
    this.storageInstructions = input.storageInstructions ?? '';
    this.name = input.name ?? '';
    this.description = input.description ?? '';
    this.slug = input.slug ?? '';
    this.shoppingSuggestions = input.shoppingSuggestions ?? '';
    this.isMeasuredVolumetrically = input.isMeasuredVolumetrically ?? false;
    this.containsFish = input.containsFish ?? false;
    this.containsShellfish = input.containsShellfish ?? false;
    this.animalFlesh = input.animalFlesh ?? false;
    this.containsEgg = input.containsEgg ?? false;
    this.isLiquid = input.isLiquid ?? false;
    this.containsSoy = input.containsSoy ?? false;
    this.containsPeanut = input.containsPeanut ?? false;
    this.animalDerived = input.animalDerived ?? false;
    this.restrictToPreparations = input.restrictToPreparations ?? false;
    this.containsDairy = input.containsDairy ?? false;
    this.containsSesame = input.containsSesame ?? false;
    this.containsTreeNut = input.containsTreeNut ?? false;
    this.containsWheat = input.containsWheat ?? false;
    this.containsAlcohol = input.containsAlcohol ?? false;
    this.containsGluten = input.containsGluten ?? false;
  }
}

export interface IValidIngredientUpdateRequestInput {
  name?: string;
  description?: string;
  warning?: string;
  iconPath?: string;
  containsDairy?: boolean;
  containsPeanut?: boolean;
  containsTreeNut?: boolean;
  containsEgg?: boolean;
  containsWheat?: boolean;
  containsShellfish?: boolean;
  containsSesame?: boolean;
  containsFish?: boolean;
  containsGluten?: boolean;
  animalFlesh?: boolean;
  isMeasuredVolumetrically?: boolean;
  isLiquid?: boolean;
  containsSoy?: boolean;
  pluralName?: string;
  animalDerived?: boolean;
  restrictToPreparations?: boolean;
  minimumIdealStorageTemperatureInCelsius?: number;
  maximumIdealStorageTemperatureInCelsius?: number;
  storageInstructions?: string;
  slug?: string;
  containsAlcohol?: boolean;
  shoppingSuggestions?: string;
}

export class ValidIngredientUpdateRequestInput implements IValidIngredientUpdateRequestInput {
  name?: string;
  description?: string;
  warning?: string;
  iconPath?: string;
  containsDairy?: boolean = false;
  containsPeanut?: boolean = false;
  containsTreeNut?: boolean = false;
  containsEgg?: boolean = false;
  containsWheat?: boolean = false;
  containsShellfish?: boolean = false;
  containsSesame?: boolean = false;
  containsFish?: boolean = false;
  containsGluten?: boolean = false;
  animalFlesh?: boolean = false;
  isMeasuredVolumetrically?: boolean = false;
  isLiquid?: boolean = false;
  containsSoy?: boolean = false;
  pluralName?: string;
  animalDerived?: boolean = false;
  restrictToPreparations?: boolean = false;
  minimumIdealStorageTemperatureInCelsius?: number;
  maximumIdealStorageTemperatureInCelsius?: number;
  storageInstructions?: string;
  slug?: string;
  containsAlcohol?: boolean = false;
  shoppingSuggestions?: string;

  constructor(
    input: {
      name?: string;
      description?: string;
      warning?: string;
      iconPath?: string;
      containsDairy?: boolean;
      containsPeanut?: boolean;
      containsTreeNut?: boolean;
      containsEgg?: boolean;
      containsWheat?: boolean;
      containsShellfish?: boolean;
      containsSesame?: boolean;
      containsFish?: boolean;
      containsGluten?: boolean;
      animalFlesh?: boolean;
      isMeasuredVolumetrically?: boolean;
      isLiquid?: boolean;
      containsSoy?: boolean;
      pluralName?: string;
      animalDerived?: boolean;
      restrictToPreparations?: boolean;
      minimumIdealStorageTemperatureInCelsius?: number;
      maximumIdealStorageTemperatureInCelsius?: number;
      storageInstructions?: string;
      slug?: string;
      containsAlcohol?: boolean;
      shoppingSuggestions?: string;
    } = {},
  ) {
    this.name = input.name;
    this.description = input.description;
    this.warning = input.warning;
    this.iconPath = input.iconPath;
    this.containsDairy = input.containsDairy ?? false;
    this.containsPeanut = input.containsPeanut ?? false;
    this.containsTreeNut = input.containsTreeNut ?? false;
    this.containsEgg = input.containsEgg ?? false;
    this.containsWheat = input.containsWheat ?? false;
    this.containsShellfish = input.containsShellfish ?? false;
    this.containsSesame = input.containsSesame ?? false;
    this.containsFish = input.containsFish ?? false;
    this.containsGluten = input.containsGluten ?? false;
    this.animalFlesh = input.animalFlesh ?? false;
    this.isMeasuredVolumetrically = input.isMeasuredVolumetrically ?? false;
    this.isLiquid = input.isLiquid ?? false;
    this.containsSoy = input.containsSoy ?? false;
    this.pluralName = input.pluralName;
    this.animalDerived = input.animalDerived ?? false;
    this.restrictToPreparations = input.restrictToPreparations ?? false;
    this.minimumIdealStorageTemperatureInCelsius = input.minimumIdealStorageTemperatureInCelsius;
    this.maximumIdealStorageTemperatureInCelsius = input.maximumIdealStorageTemperatureInCelsius;
    this.storageInstructions = input.storageInstructions;
    this.slug = input.slug;
    this.containsAlcohol = input.containsAlcohol ?? false;
    this.shoppingSuggestions = input.shoppingSuggestions;
  }
}
