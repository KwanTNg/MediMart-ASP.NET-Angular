export type Symptom = {
    symptomName : string,
    description : string,
    productSymptoms : number[],
    id : number,
    selected?: boolean;
}