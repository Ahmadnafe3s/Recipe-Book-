import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, tap  } from "rxjs";
import { Recipe } from "./recipe-model";

@Injectable()

export class RecipeService {
  toShopping = new Subject<any>()
  recipeList: Recipe[] = [];
  RecipeLink: string = 'https://recipe-book-431a4-default-rtdb.firebaseio.com/recipes.json'

  constructor(private http: HttpClient) {}


  upsertdata(formValue) {
    this.recipeList.push(formValue)
    this.http.put(this.RecipeLink, this.recipeList).subscribe(
      res => {
        console.log(res);
      }
    )
  }

  onUpdate(index: number, FormValue) {
    this.recipeList[index] = FormValue
    this.http.put(this.RecipeLink, this.recipeList).subscribe(
      res => {
        console.log(res);
      }
    )
  }

  getRecipes() {
    return this.recipeList.slice()
  }

  onDelete(deletdData:Recipe[]){
    this.http.put(this.RecipeLink, deletdData).subscribe(
      res => {
        console.log(res);
      }
    )
  }

  FetchData() {
   return this.http.get(this.RecipeLink).pipe(
      tap(
        (recipes:Recipe[]) =>{
          this.recipeList = recipes
          return recipes;
        }
      )
    )
  }
}

