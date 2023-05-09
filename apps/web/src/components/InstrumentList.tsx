import { List, Checkbox } from '@mantine/core';

import { Recipe, RecipeStepInstrument, RecipeStepVessel } from '@prixfixeco/models';
import { determineAllInstrumentsForRecipes } from '@prixfixeco/utils';

declare interface InstrumentListComponentProps {
  recipes: Recipe[];
}

export const RecipeInstrumentListComponent = ({ recipes }: InstrumentListComponentProps): JSX.Element => {
  return (
    <List icon={<></>} pb="sm">
      {determineAllInstrumentsForRecipes(recipes).map((x: RecipeStepInstrument | RecipeStepVessel) => (
        <List.Item key={x.id} my="-sm">
          <Checkbox
            size="sm"
            label={`${x.minimumQuantity}${
              (x.maximumQuantity ?? 0) > 0 && x.maximumQuantity != x.minimumQuantity ? `- ${x.maximumQuantity}` : ''
            } ${x.instrument?.name}`}
          />
        </List.Item>
      ))}
    </List>
  );
};
