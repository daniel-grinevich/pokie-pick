import { PokemonTurbo } from "@/sdk/pokeapi";


export default function PokemonSprite(props: {
  pokemon: PokemonTurbo;
  className?: string;
  lazy?: boolean;
}) {
  return (
    <img
      src={`/sprite/${props.pokemon.dexNumber}.png`}
      alt={props.pokemon.name}
      className={props.className}
      style={{ imageRendering: "pixelated" }}
      loading={props.lazy ? "lazy" : "eager"}
    />
  );
}