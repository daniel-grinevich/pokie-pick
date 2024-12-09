// utils/vote.ts
import { promises as fs } from 'fs';
import path from 'path';

// Define interfaces
interface BattlePayload {
    winner_id: number;
    winner_name: string;
    loser_id: number;
    loser_name: string;
}

interface Pokemon {
    id: number;
    name: string;
    votes_for: number;
    votes_against: number;
}

interface StatsData {
    pokemon: Pokemon[];
}

// Path to the stats.json file
const statsPath = path.resolve('./src/db/stats.json'); // Adjust the path as needed

export const recordBattle = async (payload: BattlePayload): Promise<void> => {
    const { winner_id, winner_name, loser_id, loser_name } = payload;
    console.log(`Winner: ${winner_name}, Loser: ${loser_name}`);

    try {
        // Read the current stats.json file
        const fileContents = await fs.readFile(statsPath, 'utf-8');
        const stats: StatsData = JSON.parse(fileContents);

        let winnerFound = false;
        let loserFound = false;

        // Iterate through the Pokémon array to update votes
        for (const pokemon of stats.pokemon) {
            if (pokemon.id === winner_id) {
                pokemon.votes_for += 1;
                winnerFound = true;
            }
            if (pokemon.id === loser_id) {
                pokemon.votes_against += 1;
                loserFound = true;
            }
            // If both found, no need to continue
            if (winnerFound && loserFound) break;
        }

        // If winner is not found, add them to the array
        if (!winnerFound) {
            const newWinner: Pokemon = {
                id: winner_id,
                name: winner_name,
                votes_for: 1,
                votes_against: 0,
            };
            stats.pokemon.push(newWinner);
        }

        // If loser is not found, add them to the array
        if (!loserFound) {
            const newLoser: Pokemon = {
                id: loser_id,
                name: loser_name,
                votes_for: 0,
                votes_against: 1,
            };
            stats.pokemon.push(newLoser);
        }

        // Write the updated stats back to stats.json
        await fs.writeFile(statsPath, JSON.stringify(stats, null, 2), 'utf-8');
        console.log('Battle recorded successfully.');
    } catch (error) {
        console.error('Error recording battle:', error);
        throw new Error('Failed to record battle.');
    }
};