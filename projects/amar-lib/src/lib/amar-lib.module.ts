import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DotNetReportComponent } from './dot-net-report.component';
import { BASE_URL_TOKEN } from './amar_lib.di';



@NgModule({
  declarations: [
    DotNetReportComponent,
  ],
  imports: [
    BrowserAnimationsModule
  ],
  exports: [
    DotNetReportComponent,
  ]
})
export class AmarLibModule {

  static forRoot(base_url : string) : ModuleWithProviders<AmarLibModule> {
    return {
      ngModule : AmarLibModule,
      providers: [
        {
          provide : BASE_URL_TOKEN,
          useValue : base_url
        }
      ]
    }
  }
 }
