// Demo script to show the card order fix

// Original problematic approach (what was happening before)
function oldApproach(existingCards, newSelectedValues) {
    console.log("=== OLD APPROACH (Problematic) ===");
    console.log("Existing cards:", existingCards);
    console.log("New selected values:", newSelectedValues);

    // This is what was happening before - resetting all IDs
    const cards = newSelectedValues.map((source, index) => {
        return {
            id: index, // This resets all IDs based on position
            name: source,
            type: 'supported',
        }
    });

    console.log("Result with old approach:", cards);
    return cards;
}

// New fixed approach (what we implemented)
function newApproach(existingCards, newSelectedValues) {
    console.log("\n=== NEW APPROACH (Fixed) ===");
    console.log("Existing cards:", existingCards);
    console.log("New selected values:", newSelectedValues);

    // Preserve existing card order and only add/remove cards as needed
    const existingCardsMap = new Map(existingCards.map(card => [card.name, card]));
    const newSelectedValuesSet = new Set(newSelectedValues);

    // Keep existing cards that are still selected
    const keptCards = existingCards.filter(card => newSelectedValuesSet.has(card.name));

    // Add new cards that weren't previously selected
    const newCardsToAdd = newSelectedValues
        .filter(source => !existingCardsMap.has(source))
        .map((source, index) => {
            return {
                id: existingCards.length + index, // Use a new ID that doesn't conflict
                name: source,
                type: 'supported',
            }
        });

    const updatedCards = [...keptCards, ...newCardsToAdd];

    console.log("Result with new approach:", updatedCards);
    return updatedCards;
}

// Test data
const existingCards = [
    { id: 0, name: 'github', type: 'supported' },
    { id: 1, name: 'hackernews', type: 'supported' },
    { id: 2, name: 'ai', type: 'supported' },
];

// Simulate reordering cards
const reorderedCards = [
    { id: 2, name: 'ai', type: 'supported' },      // User moved this to first position
    { id: 0, name: 'github', type: 'supported' },  // User moved this to second position
    { id: 1, name: 'hackernews', type: 'supported' }, // User moved this to third position
];

// Simulate adding a new source
const newSelectedValues = ['ai', 'github', 'hackernews', 'producthunt']; // Added producthunt

console.log("=== DEMONSTRATING THE FIX ===");
console.log("Scenario: User has reordered cards and then adds a new source");

// Show the problem with the old approach
oldApproach(reorderedCards, newSelectedValues);

// Show the solution with the new approach
newApproach(reorderedCards, newSelectedValues);

console.log("\n=== KEY DIFFERENCE ===");
console.log("Old approach resets all IDs, losing the user's reordering!");
console.log("New approach preserves existing card IDs and only adds new ones.");