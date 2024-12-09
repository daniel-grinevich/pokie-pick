interface Pokemon {
    name: string;
    url: string;
}

export async function getPokemonData(pokemon: Pokemon): Promise<any> {
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

    return data;
  }

export async function getAllPokemon(): Promise<Pokemon[]> {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=810', { 
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 86400 },
    });

    if (!response.ok) {
        throw new Error("Error fetching all Pokémon from API.");
    }

    const data = await response.json();
    // console.log(`API FETCH: all pokemon ${JSON.stringify(data)}`)
    // data.results should be an array of { name: string; url: string; }
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