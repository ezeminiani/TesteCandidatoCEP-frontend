import { Component, OnInit, OnDestroy } from '@angular/core';
import { Endereco } from '../model/endereco';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GenericService } from '../services/generic.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-testecep-localidade',
  templateUrl: './localidade.component.html',
  styleUrls: ['./localidade.component.css']
})
export class LocalidadeComponent implements OnInit, OnDestroy {

  localidade: Endereco[] = [];
  ufForm: FormGroup;
  private sub$: Subscription = new Subscription();
  ufLocalizado = true;  // deixei inicialmente como true para evitar aparecer a mensagem 'Localidades não encontradas para a UF' no primeiro acesso
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
    this.ufForm = this.fb.group({
      uf: ['', [Validators.required, Validators.pattern('^[\\w]{2}$')]]
    });
  }

  pesquisar(): void {
    if (this.ufForm.valid) {

      let returnHttpResponse: any = null;
      let subscription: Subscription;
      let urlApi = `http://localhost:5000/endereco/uf/${this.uf.value}`;

      subscription = this.genericService.get<Endereco[]>(urlApi)
      .subscribe((resp) => {
        this.aguarde = true;
        console.log('resp GET= ', resp);
        returnHttpResponse = resp;
      }
      , error => { console.error('Ocorreu um erro ao consultar as localidades', error); }
      , () => {
        this.aguarde = false;
        
        if (returnHttpResponse !== null || returnHttpResponse !== undefined) {
          const resposta = returnHttpResponse as HttpResponse<Endereco[]>;

          if (resposta.status === 200 && resposta.body.length > 0) {
            this.localidade = resposta.body;
            this.ufLocalizado = true;
          } else {
            this.localidade = [];
            this.ufLocalizado = false;
          }
        }
      });

      this.sub$.add(subscription);
    }

  }

  ativaBotaoPesquisar(): boolean {
    return this.ufForm.valid;
  }

  limpar(): void {
    this.ufForm.reset();
    this.localidade = null;
  }

  get uf() {
    return this.ufForm.get('uf');
  }

  set uf(value) {
    this.ufForm.setValue(value);
  }


}
