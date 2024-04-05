import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecipeService } from "../../Shared/features/Recipe.service";
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css'],
  animations: [
    trigger('fade', [

      state('in', style({
        transform: 'transition(0)',
        opacity: 1
      })),

      transition('* => void', [
        animate(300, keyframes([
          style({
            transform: 'translateX(-100px)',
            opacity: 1,
            offset: 0.3
          }),
          style({
            transform: 'translateX(-150px)',
            opacity: 0.5,
            offset: 0.8
          }),
          style({
            transform: 'translateX(-200px)',
            opacity: 0,
            offset: 1
          })
        ]))
      ])

    ])

  ]

})

export class ShoppingEditComponent implements OnInit, OnDestroy {
  ShoppingList: any = [];
  cancelObs: Subscription;
  delMsg: null | string;
  index: number;
  constructor(private recipeService: RecipeService,
    private route: Router,
    private active: ActivatedRoute
  ) {
    if (localStorage.getItem('Shopping') == null) {
      localStorage.setItem('Shopping', JSON.stringify([]));
    }
  }

  ngOnInit(): void {
    this.ShoppingList = JSON.parse(localStorage.getItem('Shopping'));
    if (localStorage.getItem('Shopping') !== null) {
      this.recipeService.toShopping.pipe(take(1)).subscribe((event: any) => {
        event.forEach((elements) => {  //Pushing objects into array in separate index .
          this.ShoppingList.push(elements);

        })
        localStorage.setItem('Shopping', JSON.stringify(this.ShoppingList));
      })
    }
  }


  deleteData(index: number) {
    this.index = index;
    this.delMsg = "Are you sure to delete this item"
  }

  onOk() {
    this.ShoppingList.splice(this.index, 1)
    localStorage.setItem('Shopping', JSON.stringify(this.ShoppingList));
    this.delMsg = null;
  }

  onClose() {
    this.delMsg = null;
  }

  editIngredient(index: number) {
    this.recipeService.Index.next(index.toString())
    this.route.navigate(['new'], { relativeTo: this.active })
  }


  onAddmore() {
    this.recipeService.Index.next(null)
    this.route.navigate(['new'], { relativeTo: this.active })
  }

  ngOnDestroy(): void {
  }

}
