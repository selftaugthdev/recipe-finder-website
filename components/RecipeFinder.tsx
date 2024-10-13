"use client"

import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

type Recipe = {
  label: string;
  image: string;
  url: string;
  dietLabels: string[];
  healthLabels: string[];
};

export default function RecipeFinder() {
  const [query, setQuery] = useState('');
  const [diet, setDiet] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const searchRecipes = async () => {
    setLoading(true);
    const APP_ID = process.env.NEXT_PUBLIC_EDAMAM_APP_ID;
    const APP_KEY = process.env.NEXT_PUBLIC_EDAMAM_APP_KEY;
    const url = `https://api.edamam.com/search?q=${query}&app_id=${APP_ID}&app_key=${APP_KEY}&diet=${diet}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setRecipes(data.hits.map((hit: any) => hit.recipe));
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          type="text"
          placeholder="Enter ingredients or dish name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
        />
        <Select value={diet} onValueChange={setDiet}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select diet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="high-protein">High Protein</SelectItem>
            <SelectItem value="low-fat">Low Fat</SelectItem>
            <SelectItem value="low-carb">Low Carb</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="keto">Keto</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={searchRecipes} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Search Recipes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{recipe.label}</CardTitle>
              <CardDescription>{recipe.dietLabels.join(', ')}</CardDescription>
            </CardHeader>
            <CardContent>
              <img src={recipe.image} alt={recipe.label} className="w-full h-48 object-cover rounded-md" />
              <p className="mt-2">{recipe.healthLabels.join(', ')}</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <a href={recipe.url} target="_blank" rel="noopener noreferrer">View Recipe</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}