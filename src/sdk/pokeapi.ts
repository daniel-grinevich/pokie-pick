import "server-only";
import { unstable_cacheLife as cacheLife } from 'next/cache'
 
interface Pokemon {
    name: string;
    url: string;
}

interface PokemonData {
  id: number;
  name: string;
  sprites: any;
}

export type PokemonTurbo = {
  name: string;
  dexNumber: number;
};


export async function getPokemonData(pokemon: Pokemon): Promise<any> {
  "use cache";
  cacheLife('max');

    const response = await fetch(pokemon.url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 86400 },
    });
  
    if (!response.ok) {
      throw new Error("Error fetching individual Pokémon resource from API");
    }
    
    const data = await response.json();
    // console.log(`API FETCH: detail pokemon ${JSON.stringify(data)}`)

    const pokemonData = {
      id: data.id,
      name: data.name,
      sprites: data.sprites.front_default,
    }

    return pokemonData;
  }

export async function getAllPokemon(): Promise<Pokemon[]> {
  "use cache";

  console.log("Checking if all Pokémon are cached...");
  
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=810', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 }, // Cache for 1 day
  });

  if (!response.ok) {
    throw new Error("Error fetching all Pokémon from API.");
  }

  console.log("Fetched all Pokémon from API");
  
  const data = await response.json();
  return data.results;
}

// export async function getPokemonSprite(url: string) {
//     const result = await fetch(url, {
//         next: { revalidate: 86400 },
//     })

//     if(!result.ok) {
//         throw new Error('Error fetching Pokémon sprite from API');
//     }


//     return;
// }

export async function getPokemonPair(): Promise<[any, any]> {
    const allPokemon = await getAllPokemon();
  
    const index1 = Math.floor(Math.random() * allPokemon.length);
    let index2 = Math.floor(Math.random() * allPokemon.length);

    while (index2 === index1) {
      index2 = Math.floor(Math.random() * allPokemon.length);
    }
  
    const pokemon1 = await getPokemonData(allPokemon[index1]);
    const pokemon2 = await getPokemonData(allPokemon[index2]);
  
    return [pokemon1, pokemon2];
  }

  export async function getAllPokemonTurbo() {
    "use cache";
    cacheLife("max");
  
    const query = `
      query GetAllPokemon {
        pokemon_v2_pokemon(where: {id: {_lte: 1025}}) {
          id
          pokemon_v2_pokemonspecy {
            name
          }
        }
      }
    `;
  
    const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
  
    const data = (await response.json()).data as {
      pokemon_v2_pokemon: {
        id: number;
        pokemon_v2_pokemonspecy: {
          name: string;
        };
      }[];
    };
  
    return data.pokemon_v2_pokemon.map((pokemon) => ({
      name: pokemon.pokemon_v2_pokemonspecy.name,
      dexNumber: pokemon.id,
    }));
  }
  
  import { connection } from "next/server";

  export async function getTwoRandomPokemonTurbo() {
    await connection();
  
    const allPokemon = await getAllPokemonTurbo();
    const shuffled = allPokemon.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }