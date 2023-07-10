import { List, Checkbox } from '@mantine/core';

import { Recipe, RecipeStepInstrument, RecipeStepVessel } from '@dinnerdonebetter/models';
import { determineAllInstrumentsForRecipes } from '@dinnerdonebetter/utils';

declare interface InstrumentListComponentProps {
  recipes: Recipe[];
}

export const RecipeInstrumentListComponent = ({ recipes }: InstrumentListComponentProps): JSX.Element => {
  return (
    <List icon={<></>} pb="sm">
      {determineAllInstrumentsForRecipes(recipes).map((x: RecipeStepInstrument | RecipeStepVessel) => {
        switch (x.constructor.name) {
          case 'RecipeStepInstrument':
            return (
              <List.Item key={x.id} my="-sm">
                <Checkbox
                  size="sm"
                  label={`${x.minimumQuantity}${
                    (x.maximumQuantity ?? 0) > 0 && x.maximumQuantity != x.minimumQuantity
                      ? `- ${x.maximumQuantity}`
                      : ''
                  } ${(x as RecipeStepInstrument).instrument?.name}`}
                />
              </List.Item>
            );
          case 'RecipeStepVessel':
            return (
              <List.Item key={x.id} my="-sm">
                <Checkbox
                  size="sm"
                  label={`${x.minimumQuantity}${
                    (x.maximumQuantity ?? 0) > 0 && x.maximumQuantity != x.minimumQuantity
                      ? `- ${x.maximumQuantity}`
                      : ''
                  } ${(x as RecipeStepVessel).vessel?.name}`}
                />
              </List.Item>
            );
          default:
            throw new Error(`Unknown type ${x.constructor.name}`);
        }
      })}
    </List>
  );
};
