import pfClient from '../../client';

import { Recipe } from "models";

declare interface RecipePageProps {
  recipe: Recipe;
}

function RecipePage({ recipe }: RecipePageProps) {
    return (
      <div>
        <h1>{ recipe.name }</h1>
      </div>
    )
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  const { recipeID } = context.query;

  const { data: recipe } = await pfClient.client.get<Recipe>(`/api/v1/recipes/${ recipeID}`, { withCredentials: true, headers: {
    Cookie: `prixfixecookie=${context.req.cookies['prixfixecookie']}`,
  }});

  return { props: { recipe: recipe } }
}

export default RecipePage;
