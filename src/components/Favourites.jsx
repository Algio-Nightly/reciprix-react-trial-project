import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CartRecipeCard from './CartRecipeCard';

const FavoritesPage = ({ favorites = [], toggleFavorite, setRecipeChecked }) => {
    const [groceryList, setGroceryList] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);

    const updateGroceryList = async () => {
        // Only aggregate items that are checked
        const checkedFavorites = favorites.filter(fav => fav.isChecked);
        
        if (checkedFavorites.length === 0) {
            setGroceryList({});
            return;
        }
        setIsUpdating(true);
        try {
            const list = await getShoppingCart(checkedFavorites);
            setGroceryList(list);
        } catch (error) {
            console.error("Error updating grocery list:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        updateGroceryList();
    }, [favorites]);

    const getShoppingCart = async (checkedItems) => {
        let groceryList = {};
        for (const recipe of checkedItems) {
            const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipe.idMeal}`);
            const meals = response.data.meals;
            if (meals && meals[0]) {
                const ingredients = getIngredients(meals[0]);
                
                ingredients.forEach(item => {
                    if (groceryList[item.name]) {
                        // Aggregate measures as an array for display
                        if (!Array.isArray(groceryList[item.name])) {
                            groceryList[item.name] = [groceryList[item.name]];
                        }
                        groceryList[item.name].push(item.measure);
                    } else {
                        groceryList[item.name] = item.measure;
                    }
                });
            }
        }
        return groceryList;
    }

    return (
        <div className="flex h-[calc(100vh-72px)] w-full bg-white text-gray-900 font-sans overflow-hidden">
            
            {/* ================= LEFT PANEL (75%): The Menu ================= */}
            <main className="w-3/4 h-full overflow-y-auto p-8 md:p-12">
                <div className="border-b-4 border-black pb-4 mb-8">
                    <h1 className="text-5xl font-black uppercase tracking-tighter">Meal Planner</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest mt-1">
                        Select meals to generate your grocery list
                    </p>
                </div>

                <div className="flex flex-wrap gap-6">
                    {favorites.length > 0 ? (
                        favorites.map(recipe => (
                            <CartRecipeCard 
                                key={recipe.idMeal} 
                                recipe={recipe} 
                                toggleFavorite={toggleFavorite} 
                                onCheckChange={(isChecked) => setRecipeChecked(recipe.idMeal, isChecked)}
                            />
                        ))
                    ) : (
                        <div className="w-full text-center py-20 border-4 border-dashed border-zinc-200 rounded-3xl">
                            <h2 className="text-2xl font-black text-zinc-300 uppercase tracking-widest">Your Vault is Empty</h2>
                            <p className="text-zinc-400 font-bold uppercase tracking-tight mt-2">Start adding recipes from Home or Browse!</p>
                        </div>
                    )}
                </div>
            </main>

            {/* ================= RIGHT PANEL (25%): The Grocery List ================= */}
            <aside className="w-1/4 h-full border-l-4 border-black bg-zinc-50 flex flex-col">
                
                {/* Sticky Header */}
                <div className="p-6 border-b-4 border-black bg-zinc-50 sticky top-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-widest">Groceries</h2>
                        <p className="text-xs font-bold text-zinc-500 uppercase mt-1">
                            {favorites.filter(f => f.isChecked).length} Meals Aggregated
                        </p>
                    </div>
                    {isUpdating && <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>}
                </div>

                {/* Scrollable List Area */}
                <div className="p-6 overflow-y-auto flex-grow bg-white">
                    
                    {Object.keys(groceryList).length > 0 ? (
                        <ul className="space-y-6">
                            {Object.entries(groceryList).map(([ingredient, measure]) => (
                                <li key={ingredient} className="flex flex-col border-b border-zinc-100 pb-4 last:border-none">
                                    <span className="font-black uppercase tracking-tight text-black text-lg">
                                        {ingredient}
                                    </span>
                                    <span className="text-sm font-bold text-zinc-400 italic mt-0.5 leading-tight">
                                        {Array.isArray(measure) ? measure.join(', ') : measure}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12 text-zinc-300 font-bold uppercase tracking-widest border-4 border-dashed border-zinc-100 rounded-2xl h-full flex flex-col justify-center">
                            <p>{isUpdating ? "Calculating..." : "No Meals Selected"}</p>
                        </div>
                    )}

                </div>

                {/* Export Button */}
                <div className="p-6 border-t-4 border-black bg-zinc-50 mt-auto">
                    <button 
                        onClick={() => {
                            const text = Object.entries(groceryList).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
                            navigator.clipboard.writeText(text);
                            alert("Copied to clipboard!");
                        }}
                        disabled={Object.keys(groceryList).length === 0}
                        className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        Copy to Clipboard
                    </button>
                </div>

            </aside>
            
        </div>
    );
};

export default FavoritesPage;

const getIngredients = (recipe) => {
    const ingredients = [];
    if (!recipe) return ingredients;
    for (let i = 1; i <= 20; i++) {
        const name = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (name && name.trim() !== "") {
            ingredients.push({
                name: name,
                measure: measure,
                img: `https://www.themealdb.com/images/ingredients/${name}.png`
            });
        }
    }
    return ingredients;
}