import { QueryFilteredResult } from "./pagination";

export class ValidIngredient {
  lastUpdatedAt?: string;
  archivedAt?: string;
  name: string;
  description: string;
  warning: string;
  id: string;
  iconPath: string;
  createdAt: string;
  containsSesame: boolean;
  containsSoy: boolean;
  containsShellfish: boolean;
  containsTreeNut: boolean;
  containsFish: boolean;
  containsGluten: boolean;
  animalFlesh: boolean;
  isMeasuredVolumetrically: boolean;
  isLiquid: boolean;
  containsPeanut: boolean;
  containsDairy: boolean;
  containsEgg: boolean;
  containsWheat: boolean;
  animalDerived: boolean;
  restrictToPreparations: boolean;
  minimumIdealStorageTemperatureInCelsius?: number;
  maximumIdealStorageTemperatureInCelsius?: number;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      name?: string;
      description?: string;
      warning?: string;
      id?: string;
      iconPath?: string;
      createdAt?: string;
      containsSesame?: boolean;
      containsSoy?: boolean;
      containsShellfish?: boolean;
      containsTreeNut?: boolean;
      containsFish?: boolean;
      containsGluten?: boolean;
      animalFlesh?: boolean;
      isMeasuredVolumetrically?: boolean;
      isLiquid?: boolean;
      containsPeanut?: boolean;
      containsDairy?: boolean;
      containsEgg?: boolean;
      containsWheat?: boolean;
      animalDerived?: boolean;
      restrictToPreparations?: boolean;
      minimumIdealStorageTemperatureInCelsius?: number;
      maximumIdealStorageTemperatureInCelsius?: number;
    } = {}
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.name = input.name || "";
    this.description = input.description || "";
    this.warning = input.warning || "";
    this.id = input.id || "";
    this.iconPath = input.iconPath || "";
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.containsSesame = Boolean(input.containsSesame);
    this.containsSoy = Boolean(input.containsSoy);
    this.containsShellfish = Boolean(input.containsShellfish);
    this.containsTreeNut = Boolean(input.containsTreeNut);
    this.containsFish = Boolean(input.containsFish);
    this.containsGluten = Boolean(input.containsGluten);
    this.animalFlesh = Boolean(input.animalFlesh);
    this.isMeasuredVolumetrically = Boolean(input.isMeasuredVolumetrically);
    this.isLiquid = Boolean(input.isLiquid);
    this.containsPeanut = Boolean(input.containsPeanut);
    this.containsDairy = Boolean(input.containsDairy);
    this.containsEgg = Boolean(input.containsEgg);
    this.containsWheat = Boolean(input.containsWheat);
    this.animalDerived = Boolean(input.animalDerived);
    this.restrictToPreparations = Boolean(input.restrictToPreparations);
    this.minimumIdealStorageTemperatureInCelsius =
      input.minimumIdealStorageTemperatureInCelsius;
    this.maximumIdealStorageTemperatureInCelsius =
      input.maximumIdealStorageTemperatureInCelsius;
  }
}

export class ValidIngredientList extends QueryFilteredResult<ValidIngredient> {
  constructor(
    input: {
      data?: ValidIngredient[];
      page?: number;
      limit?: number;
      filteredCount?: number;
      totalCount?: number;
    } = {}
  ) {
    super(input);

    this.data = input.data || [];
    this.page = input.page || 1;
    this.limit = input.limit || 20;
    this.filteredCount = input.filteredCount || 0;
    this.totalCount = input.totalCount || 0;
  }
}

export class ValidIngredientCreationRequestInput {
  name: string;
  description: string;
  warning: string;
  iconPath: string;
  containsDairy: boolean;
  containsPeanut: boolean;
  containsTreeNut: boolean;
  containsEgg: boolean;
  containsWheat: boolean;
  containsShellfish: boolean;
  containsSesame: boolean;
  containsFish: boolean;
  containsGluten: boolean;
  animalFlesh: boolean;
  isMeasuredVolumetrically: boolean;
  isLiquid: boolean;
  containsSoy: boolean;
  animalDerived: boolean;
  restrictToPreparations: boolean;
  minimumIdealStorageTemperatureInCelsius?: number;
  maximumIdealStorageTemperatureInCelsius?: number;

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
      animalDerived?: boolean;
      restrictToPreparations?: boolean;
      minimumIdealStorageTemperatureInCelsius?: number;
      maximumIdealStorageTemperatureInCelsius?: number;
    } = {}
  ) {
    this.name = input.name || "";
    this.description = input.description || "";
    this.warning = input.warning || "";
    this.iconPath = input.iconPath || "";
    this.containsDairy = Boolean(input.containsDairy);
    this.containsPeanut = Boolean(input.containsPeanut);
    this.containsTreeNut = Boolean(input.containsTreeNut);
    this.containsEgg = Boolean(input.containsEgg);
    this.containsWheat = Boolean(input.containsWheat);
    this.containsShellfish = Boolean(input.containsShellfish);
    this.containsSesame = Boolean(input.containsSesame);
    this.containsFish = Boolean(input.containsFish);
    this.containsGluten = Boolean(input.containsGluten);
    this.animalFlesh = Boolean(input.animalFlesh);
    this.isMeasuredVolumetrically = Boolean(input.isMeasuredVolumetrically);
    this.isLiquid = Boolean(input.isLiquid);
    this.containsSoy = Boolean(input.containsSoy);
    this.animalDerived = Boolean(input.animalDerived);
    this.restrictToPreparations = Boolean(input.restrictToPreparations);
    this.minimumIdealStorageTemperatureInCelsius =
      input.minimumIdealStorageTemperatureInCelsius;
    this.maximumIdealStorageTemperatureInCelsius =
      input.maximumIdealStorageTemperatureInCelsius;
  }

  static fromValidIngredient(
    input: ValidIngredient
  ): ValidIngredientCreationRequestInput {
    const x = new ValidIngredientCreationRequestInput();

    x.name = input.name;
    x.description = input.description;
    x.warning = input.warning;
    x.iconPath = input.iconPath;
    x.containsDairy = input.containsDairy;
    x.containsPeanut = input.containsPeanut;
    x.containsTreeNut = input.containsTreeNut;
    x.containsEgg = input.containsEgg;
    x.containsWheat = input.containsWheat;
    x.containsShellfish = input.containsShellfish;
    x.containsSesame = input.containsSesame;
    x.containsFish = input.containsFish;
    x.containsGluten = input.containsGluten;
    x.animalFlesh = input.animalFlesh;
    x.isMeasuredVolumetrically = input.isMeasuredVolumetrically;
    x.isLiquid = input.isLiquid;
    x.containsSoy = input.containsSoy;
    x.animalDerived = input.animalDerived;
    x.restrictToPreparations = input.restrictToPreparations;
    x.minimumIdealStorageTemperatureInCelsius =
      input.minimumIdealStorageTemperatureInCelsius;
    x.maximumIdealStorageTemperatureInCelsius =
      input.maximumIdealStorageTemperatureInCelsius;

    return x;
  }
}

export class ValidIngredientUpdateRequestInput {
  id?: string;
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
  animalDerived: boolean;
  restrictToPreparations: boolean;
  minimumIdealStorageTemperatureInCelsius?: number;
  maximumIdealStorageTemperatureInCelsius?: number;

  constructor(
    input: {
      id?: string;
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
      animalDerived?: boolean;
      restrictToPreparations?: boolean;
      minimumIdealStorageTemperatureInCelsius?: number;
      maximumIdealStorageTemperatureInCelsius?: number;
    } = {}
  ) {
    this.id = input.id;
    this.name = input.name;
    this.description = input.description;
    this.warning = input.warning;
    this.iconPath = input.iconPath;
    this.containsDairy = input.containsDairy;
    this.containsPeanut = input.containsPeanut;
    this.containsTreeNut = input.containsTreeNut;
    this.containsEgg = input.containsEgg;
    this.containsWheat = input.containsWheat;
    this.containsShellfish = input.containsShellfish;
    this.containsSesame = input.containsSesame;
    this.containsFish = input.containsFish;
    this.containsGluten = input.containsGluten;
    this.animalFlesh = input.animalFlesh;
    this.isMeasuredVolumetrically = input.isMeasuredVolumetrically;
    this.isLiquid = input.isLiquid;
    this.containsSoy = input.containsSoy;
    this.animalDerived = Boolean(input.animalDerived);
    this.restrictToPreparations = Boolean(input.restrictToPreparations);
    this.minimumIdealStorageTemperatureInCelsius =
      input.minimumIdealStorageTemperatureInCelsius;
    this.maximumIdealStorageTemperatureInCelsius =
      input.maximumIdealStorageTemperatureInCelsius;
  }

  static fromValidIngredient(
    input: ValidIngredient
  ): ValidIngredientUpdateRequestInput {
    const x = new ValidIngredientUpdateRequestInput();

    x.name = input.name;
    x.description = input.description;
    x.warning = input.warning;
    x.iconPath = input.iconPath;
    x.containsDairy = input.containsDairy;
    x.containsPeanut = input.containsPeanut;
    x.containsTreeNut = input.containsTreeNut;
    x.containsEgg = input.containsEgg;
    x.containsWheat = input.containsWheat;
    x.containsShellfish = input.containsShellfish;
    x.containsSesame = input.containsSesame;
    x.containsFish = input.containsFish;
    x.containsGluten = input.containsGluten;
    x.animalFlesh = input.animalFlesh;
    x.isMeasuredVolumetrically = input.isMeasuredVolumetrically;
    x.isLiquid = input.isLiquid;
    x.containsSoy = input.containsSoy;
    x.animalDerived = input.animalDerived;
    x.restrictToPreparations = input.restrictToPreparations;
    x.minimumIdealStorageTemperatureInCelsius =
      input.minimumIdealStorageTemperatureInCelsius;
    x.maximumIdealStorageTemperatureInCelsius =
      input.maximumIdealStorageTemperatureInCelsius;

    return x;
  }
}
