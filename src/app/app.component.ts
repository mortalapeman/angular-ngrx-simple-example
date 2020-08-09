import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Store,
  createAction,
  props,
  Action,
  createReducer,
  on,
  select,
  createSelector,
  ActionReducerMap } from '@ngrx/store';
import { Observable } from 'rxjs';

// Each component needs a state class
export class AppComponentState {
  constructor(title?: string) {
    this.title = title;
  }

  title: string;
}
// Each module needs a state class
export class AppComponentModuleState {
  component: AppComponentState = new AppComponentState();
}

// Actions can be pretty freely defined
const changeTitleAction = createAction('[Main] Change Title', props<{ title: string}>());

// Reducer for updating fields
const titleReducer = createReducer(
  new AppComponentState('Initial Title'),
  on(changeTitleAction, (old, $new) => {
    return ({... old, title: $new.title});
  }));

// Needs to be exported for AoT reasons?
export function reducer(state: AppComponentState | undefined, action: Action): AppComponentState {
  return titleReducer(state, action);
}

// Overall global state should be captured with a single object and all relevant reducers
// should be registered in this way.
export const reducers: ActionReducerMap<AppComponentModuleState> = { component: reducer };

// Selector for the title specifically
export const getTitle = createSelector((state: AppComponentModuleState) => state.component, (state: AppComponentState) => state.title);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  store: Store;
  title$: Observable<string>;
  titleControl: FormControl = new FormControl('');

  constructor(store: Store) {
    this.store = store;
  }
  ngOnInit(): void {
    this.titleControl.valueChanges.pipe().subscribe((v) => this.store.dispatch(changeTitleAction({ title: v })));
    this.title$ = this.store.pipe(select(getTitle));
  }
}
