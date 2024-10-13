"use client"

import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

type AnalyzedRecipe = {
  uri: string;
  calories: number;
  totalWeight: number;
  dietLabels: string[];
  healthLabels: string[];
  cautions: string[];
  totalNutrients: Record<string, { label: string; quantity: number; unit: string }>;
};

export default function RecipeFinder() {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [analyzedRecipe, setAnalyzedRecipe] = useState<AnalyzedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeRecipe = async () => {
    setLoading(true);
    setError(null);
    const APP_ID = process.env.NEXT_PUBLIC_EDAMAM_APP_ID;
    const APP_KEY = process.env.NEXT_PUBLIC_EDAMAM_APP_KEY;
    
    const url = `https://api.edamam.com/api/nutrition-details?app_id=${APP_ID}&app_key=${APP_KEY}`;
    
    const ingredientList = ingredients.split('\n').filter(ingr => ingr.trim() !== '');

    const recipeData = {
      title: title,
      ingr: ingredientList
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      setAnalyzedRecipe(data);
    } catch (error) {
      console.error('Error analyzing recipe:', error);
      if (error instanceof Error) {
        if (error.message.includes('555')) {
          setError('Recipe with insufficient quality to process correctly.');
        } else {
          setError(`Failed to analyze recipe: ${error.message}`);
        }
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipe Nutrition Analyzer</h1>
      <div className="space-y-4 mb-8">
        <Input
          type="text"
          placeholder="Enter recipe title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full h-32 p-2 border rounded"
          placeholder="Enter ingredients (one per line)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <Button onClick={analyzeRecipe} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Analyze Recipe
        </Button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {analyzedRecipe && (
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Calories: {analyzedRecipe.calories.toFixed(0)} | 
              Weight: {analyzedRecipe.totalWeight.toFixed(0)}g
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>Diet Labels:</strong> {analyzedRecipe.dietLabels.join(', ')}</p>
            <p><strong>Health Labels:</strong> {analyzedRecipe.healthLabels.join(', ')}</p>
            <p><strong>Cautions:</strong> {analyzedRecipe.cautions.join(', ')}</p>
            <h3 className="font-bold mt-4 mb-2">Nutrients:</h3>
            <ul>
              {Object.entries(analyzedRecipe.totalNutrients).slice(0, 5).map(([key, nutrient]) => (
                <li key={key}>
                  {nutrient.label}: {nutrient.quantity.toFixed(2)} {nutrient.unit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}