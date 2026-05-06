import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DecisionBoardPageRoutingModule } from './decision-board-routing.module';

import { DecisionBoardPage } from './decision-board.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExploreContainerComponentModule,
    DecisionBoardPageRoutingModule
  ],
  declarations: [DecisionBoardPage]
})
export class DecisionBoardPageModule {}
