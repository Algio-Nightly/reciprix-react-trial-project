import { Link } from 'react-router-dom';
import RecipePage from './Recipe';
import { useState } from 'react';
import heart from "../assets/heart.png";
import heartFilled from "../assets/heart-filled.png";

const RecipeCard = ({ recipe, toggleFavorite, favorites = [] }) => {
    const isFavourite = favorites.some(fav => fav.idMeal === recipe.idMeal);
    
    const handleFavourite = () => {
        toggleFavorite(recipe.idMeal, recipe.strMeal, recipe.strCategory, recipe.strArea, recipe.strMealThumb, 1, !isFavourite);
    }
    

    return (
        <div className="group h-[480px] w-full max-w-[350px] bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-zinc-100 flex flex-col">
            <div className="relative h-56 overflow-hidden">
                <img
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm text-zinc-800">
                    {recipe.strCategory}

                </div>
            </div>

            <div className="p-6 flex flex-col flex-1 justify-between bg-zinc-50/30">
                <div className="space-y-3">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-tight line-clamp-2 italic">
                        {recipe.strMeal}
                    </h3>
                    <div className="h-1.5 w-12 bg-black"></div>
                </div>

                <div className="flex gap-3 w-full h-14 mt-6">
                    <Link to={`/recipe/${recipe.idMeal}`} className="flex-1 h-full">
                        <button className="w-full h-full bg-black text-white px-4 rounded-2xl hover:bg-zinc-800 transition-all duration-200 font-bold uppercase tracking-widest text-xs flex items-center justify-center">
                            View Recipe
                        </button>
                    </Link>
                    <button onClick={handleFavourite} className="h-full aspect-square bg-white border border-black border-2 text-xl rounded-2xl ">
                        <img src={isFavourite ? heartFilled : heart} alt="" className='scale-200' />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;