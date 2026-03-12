import React from 'react';
import { Link } from 'react-router-dom';

const CartRecipeCard = ({ recipe, toggleFavorite, onCheckChange }) => {
    const handleRemove = () => {
        toggleFavorite(recipe.idMeal, recipe.strMeal, recipe.strCategory, recipe.strArea, recipe.strMealThumb, 1, false);
    };

    return (
        <div className="relative flex flex-col border-4 border-black bg-white rounded-2xl overflow-hidden w-full max-w-[320px]">

            {/* Top Left Checkbox */}
            <div className="absolute top-4 left-4 z-10 bg-white border-2 border-black rounded-md p-1 shadow-sm">
                <input
                    type="checkbox"
                    checked={recipe.isChecked}
                    onChange={(e) => onCheckChange(e.target.checked)}
                    className="w-5 h-5 border-2 border-black rounded-sm cursor-pointer accent-black block"
                />
            </div>

            {/* Top: Image Section */}
            <div className="w-full h-48 border-b-4 border-black relative bg-zinc-100">
                <img
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    // Kept the grayscale hover just so it doesn't feel entirely dead, 
                    // but you can remove the transition classes if you want it 100% static.
                    className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-300"
                />
            </div>

            {/* Bottom: Details & Action Row */}
            <div className="p-5 flex flex-col flex-grow justify-between bg-white">

                {/* Header Info */}
                <div className="mb-6">
                    <h3 className="text-xl font-black uppercase tracking-tight leading-tight mb-2 line-clamp-2">
                        {recipe.strMeal}
                    </h3>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        {recipe.strCategory} • {recipe.strArea}
                    </p>
                </div>

                {/* The New Action Row: Added gap-2 and individual borders/rounding */}
                <div className="flex h-12 w-full mt-auto gap-2">

                    {/* Minus Button */}
                    <button
                        onClick={handleRemove}
                        className="w-12 flex-shrink-0 bg-white text-black text-2xl font-black flex items-center justify-center hover:bg-zinc-100 transition-colors border-4 border-black rounded-xl"
                    >
                        −
                    </button>

                    {/* Middle View Recipe Button */}
                    <button className="flex-grow bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-colors border-4 border-black rounded-xl">
                        <Link to={`/recipe/${recipe.idMeal}`}>View Recipe</Link>
                    </button>

                    {/* Plus Button */}
                    <button className="w-12 flex-shrink-0 bg-white text-black text-2xl font-black flex items-center justify-center hover:bg-zinc-100 transition-colors border-4 border-black rounded-xl">
                        +
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CartRecipeCard;