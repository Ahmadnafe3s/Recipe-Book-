import { NgModule } from "@angular/core";
import { AuthGuard } from "../auth/Auth-guard.service";
import { RecipeBookComponent } from "./recipe-book.component";
import { RecipeDetailsComponent } from "./recipe-details/recipe-details.component";
import { SelectRecipeComponent } from "./select-recipe/select-recipe.component";
import { RouterModule, Routes } from "@angular/router";

const RecipeRoute:Routes = [
    {
      path: '', canActivate:[AuthGuard] , component: RecipeBookComponent,  children: [
        { path: '', component: SelectRecipeComponent },
        { path: ':id/:name', component: RecipeDetailsComponent }
      ]
    },
]

@NgModule({
    imports:[RouterModule.forChild(RecipeRoute)],
    exports:[RouterModule]
})


export class RecipeRoutingModule{

}