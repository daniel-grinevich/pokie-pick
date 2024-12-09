// Import necessary modules
import { getPokemonPair } from "@/sdk/pokeapi";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { Suspense } from "react";
import { recordBattle } from "./utils/vote";

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-extrabold mb-4">Which one would you rather catch?</h1>
      <Suspense fallback={<div>Loading . . .</div>}>
        <GetPokemonVote />
      </Suspense>
    </div>
  );
}

async function GetPokemonVote() {
  const pokemonPair = await getPokemonPair();

  return (
    <div className="flex flex-row gap-4">
      {pokemonPair.map((pokemon, index) => {
        // Determine the loser
        const loser = pokemonPair[index === 0 ? 1 : 0];
        const pokemonName: string = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        
      

        return (
          <form key={pokemon.id} action={handleVote} className="flex flex-col p-4 border border-black items-center w-[200px]">
            <div className="flex flex-row gap-1">
              <h2 className="font-extrabold">{pokemon.id}</h2>
              <h2>{pokemonName}</h2>
            </div>
            <div>
              <Image
                src={pokemon.sprites.front_default}
                width={100}
                height={100}
                alt={`Image for pokemon ${pokemon.name}`}
              />
            </div>
            {/* Hidden inputs to send winner and loser data */}
            <input type="hidden" name="winner_id" value={pokemon.id} />
            <input type="hidden" name="winner_name" value={pokemon.name} />
            <input type="hidden" name="loser_id" value={loser.id} />
            <input type="hidden" name="loser_name" value={loser.name} />
            <button
              className="px-4 py-2 w-full bg-black text-white"
              type="submit"
            >
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

  const winner_name = formData.get("winner_name");
  const loser_name = formData.get("loser_name");
  const winner_id = formData.get("winner_id");
  const loser_id = formData.get("loser_id");

  const payload = {
    winner_id: winner_id,
    winner_name: winner_name,
    loser_id: loser_id,
    loser_name: loser_name
  }

 
  console.log("Voted for", winner_name);
  await recordBattle(payload); // Ensure recordBattle handles an object
  revalidatePath("/");
}