import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RecipeCard from './RecipeCard';
function HomePage({ randomRecipesBanner, randomRecipes, loading, toggleFavorite, favorites }) {
    if (loading) {
        return (
            <div className="w-full h-[80vh] flex items-center justify-center bg-zinc-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }
    return (
        <div>
            <Banner items={randomRecipesBanner} />
            <FeaturedRecipes items={randomRecipes} toggleFavorite={toggleFavorite} favorites={favorites} />
        </div>
    );
}

export default HomePage;


const Banner = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!items || items.length === 0 || !items[currentIndex]) return null;

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? items.length - 1 : prevIndex - 1
        );
    };

    return (

        <div className="relative w-full h-[80vh] overflow-hidden bg-zinc-100">

            <img
                src={items[currentIndex].strMealThumb}
                alt={items[currentIndex].strMeal || 'Banner image'}
                className="w-full h-full object-cover"
            />

            {items[currentIndex].strMeal && (
                <div className="absolute bottom-12 left-0 pl-16 pr-32 py-10 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10 flex flex-col items-start gap-4">
                    <h1 className="text-4xl font-black font-lexend-exa uppercase tracking-[0.2em] text-white drop-shadow-2xl">
                        {items[currentIndex].strMeal}
                    </h1>
                    <Link to={`/recipe/${items[currentIndex].idMeal}`}>
                        <button className="px-8 py-3 bg-white text-black border-2 border-dashed border-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            View Recipe
                        </button>
                    </Link>
                </div>
            )}

            <button
                onClick={prevSlide}
                className="absolute h-25 left-6 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity bg-black"
                aria-label="Previous slide"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <button
                onClick={nextSlide}
                className="absolute h-25 right-6 top-1/2 -translate-y-1/2 text-white opacity-70 hover:opacity-100 transition-opacity bg-black"
                aria-label="Next slide"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>


        </div>
    );
};


const FeaturedRecipes = ({ items, toggleFavorite, favorites }) => {
    if (!items || !Array.isArray(items)) return null;
    return (
        <div className="px-12 py-12 flex flex-col gap-6 justify-center items-center">
            <h1 className="text-4xl font-black uppercase tracking-widest text-black">Featured Recipes</h1>
            <div className="flex flex-wrap gap-6 justify-center items-center">
                {items.map((recipe, index) => {
                    return (
                        <RecipeCard
                            key={recipe.idMeal || index}
                            recipe={recipe}
                            toggleFavorite={toggleFavorite}
                            favorites={favorites}
                        />
                    )
                })}
            </div>
        </div>
    )
}