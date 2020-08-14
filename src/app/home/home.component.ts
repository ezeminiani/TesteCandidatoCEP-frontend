import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GenericService } from '../services/generic.service';
import { Subscription } from 'rxjs';
import { Endereco } from '../model/endereco';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-testecep-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  localidade: Endereco = null;
  cepForm: FormGroup;
  private sub$: Subscription = new Subscription();
  cepLocalizado = true;   // deixei inicialmente como true para evitar aparecer a mensagem 'CEP não localizado' no primeiro acesso
  aguarde = false;

  constructor(private fb: FormBuilder, private genericService: GenericService) { }

  ngOnInit() {
    this.validationForm();
  }

  ngOnDestroy(): void {
    if (this.sub$ !== null && this.sub$ !== undefined) {
      this.sub$.unsubscribe();
    }
  }

  validationForm() {
    this.cepForm = this.fb.group({
      cep: ['', [Validators.required, Validators.pattern('^[\\d]{8}$')]],
      local: ['', Validators.required]
    });
  }

  ativaBotaoPesquisar(): boolean {
    return this.cepForm.valid;
  }

  pesquisar(): void {
    if (this.cepForm.valid) {

      let returnHttpResponse: any = null;
      let subscription: Subscription;
      let urlApi = `http://localhost:5000/endereco/cep/${this.cep.value}`;

      if (this.local.value === 'internet') {
        urlApi = `http://localhost:5000/endereco/cep/${this.cep.value}/web`;
      }

      subscription = this.genericService.get<Endereco>(urlApi)
      .subscribe((resp) => {
        this.aguarde = true;
        console.log('resp GET= ', resp);
        returnHttpResponse = resp;
      }
      , error => { console.error('Ocorreu um erro ao consultar o CEP', error); }
      , () => {

        setTimeout(() => {
          this.aguarde = false;

          if (returnHttpResponse !== null || returnHttpResponse !== undefined) {
            const resposta = returnHttpResponse as HttpResponse<Endereco>;
  
            if (resposta.status === 200 && resposta.body !== null) {
              this.localidade = resposta.body;
              this.cepLocalizado = true;
            } else {
              this.localidade = null;
              this.cepLocalizado = false;
            }
          }
        }, 500);
      });

      this.sub$.add(subscription);
    }
  }

  limpar(): void {
    this.cepForm.reset();
    this.localidade = null;
  }

  get cep() {
    return this.cepForm.get('cep');
  }

  set cep(value) {
    this.cepForm.setValue(value);
  }

  get local() {
    return this.cepForm.get('local');
  }

  set local(value) {
    this.cepForm.setValue(value);
  }


}
