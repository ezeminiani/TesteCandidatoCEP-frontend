export interface Endereco {
    id: number;
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    unidade?: number;
    ibge?: number;
    gia: string;
}
