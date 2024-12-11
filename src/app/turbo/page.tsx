// Import necessary modules
import { getPokemonPair } from "@/sdk/pokeapi";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { Suspense } from "react";
import { recordBattle } from "@/app/utils/vote";
import { cookies } from "next/headers";

interface PokemonData {
    id: number;
    name: string;
    sprites: any;
}

export const metadata = {
  title: "Over-Optimized Version",
  description: "Implementation of pokemon api using cookies",
};

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-extrabold mb-4">TURBO: Which one would you rather catch?</h1>
      <Suspense fallback={<div>Loading . . .</div>}>
        <GetPokemonVote />
      </Suspense>
    </div>
  );
}

async function GetPokemonVote() {
    const cookiesData = await cookies();
    const currentPokemonPairJSON = cookiesData.get("currentPair")?.value;
  
    console.log("currentPokemonPairJSON: ", currentPokemonPairJSON);
  
    // Fetch pairs in parallel
    const [currentPokemonPair, nextPair] = await Promise.all([
      currentPokemonPairJSON
        ? (JSON.parse(currentPokemonPairJSON) as [PokemonData, PokemonData])
        : getPokemonPair(),
      getPokemonPair(),
    ]);
  
    console.log("currentPokemonPairX: ", JSON.stringify(currentPokemonPair, null, 2));
    console.log(`Next Pair: ${JSON.stringify(nextPair, null, 2)}`);
  
    return (
      <div className="flex flex-row gap-4">
        {currentPokemonPair.map((pokemon, index) => {
          const loser = currentPokemonPair[index === 0 ? 1 : 0];
          const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  
          return (
            <form
              key={pokemon.id}
              action={handleVote}
              className="flex flex-col p-4 border border-black items-center w-[200px]"
            >
              <div className="flex flex-row gap-1">
                <h2 className="font-extrabold">{pokemon.id}</h2>
                <h2>{pokemonName}</h2>
              </div>
              <div>
                <Image
                  src={pokemon.sprites}
                  width={100}
                  height={100}
                  alt={`Image for pokemon ${pokemon.name}`}
                  priority={true}
                />
              </div>
              <input type="hidden" name="winner_id" value={pokemon.id} />
              <input type="hidden" name="winner_name" value={pokemon.name} />
              <input type="hidden" name="loser_id" value={loser.id} />
              <input type="hidden" name="loser_name" value={loser.name} />
              {nextPair.map((nextPokemon, index) => (
                <div key={nextPokemon.id} className="hidden">
                    <Image
                        key={nextPokemon.id}
                        src={nextPokemon.sprites}
                        alt={`Image for pokemon ${nextPokemon.name}`}
                        width={50}
                        height={50}
                        className="hidden" // Keep it hidden if not yet needed
                        loading="lazy" // Explicitly lazy-load the image
                    />
                    <input type="hidden" name={`nextPair[${index}].id`} value={nextPokemon.id} />
                    <input type="hidden" name={`nextPair[${index}].name`} value={nextPokemon.name} />
                    <input type="hidden" name={`nextPair[${index}].sprites`} value={nextPokemon.sprites} />
                </div>
              ))}
              <button className="px-4 py-2 w-full bg-black text-white" type="submit">
                Vote
              </button>
            </form>
          );
        })}
      </div>
    );
}

// Server Action to handle the vote
async function handleVote(formData: FormData) {
    "use server";
  
    const winner_name = formData.get("winner_name") as string;
    const loser_name = formData.get("loser_name") as string;
    const winner_id = formData.get("winner_id") as string;
    const loser_id = formData.get("loser_id") as string;
  
    const nextPair = [];
  
    // Extract the next pair data
    for (let i = 0; i < 2; i++) {
      const id = formData.get(`nextPair[${i}].id`) as string;
      const name = formData.get(`nextPair[${i}].name`) as string;
      const sprites = formData.get(`nextPair[${i}].sprites`) as string;
  
      nextPair.push({ id, name, sprites });
    }
  
    console.log(`COOKIES NEXT PAIR: ${JSON.stringify(nextPair, null, 2)}`);
  
    const payload = {
      winner_id,
      winner_name,
      loser_id,
      loser_name,
    };
  
    console.log("Voted for", winner_name);
    await recordBattle(payload); // Ensure recordBattle handles an object
  
    const jar = await cookies();
    jar.set("currentPair", JSON.stringify(nextPair)); // Store the pair as a JSON array of objects
  }