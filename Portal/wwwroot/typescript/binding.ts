export class Binding {

    public static createState(state: any) {
        return new Proxy(state, {
            set(target, property, value) {
                target[property] = value;
                Binding.render(state);
                return true;
            }
        });
    };

    public static addListeners(state: any) {

        const listeners = document.querySelectorAll('[data-model]');

        listeners.forEach((listener) => {

            const element = <HTMLElement>listener;
            const name = element.dataset['model'];
            const role = element.dataset['role'];

            switch (role) {
                case 'combobox':

                    //console.log("Add Listeners: ComboBoxes");

                    var elementName = "#" + name;
                    var combobox = $(elementName).data("kendoComboBox");

                    //console.log(elementName);
                    //console.log(combobox);


                    combobox.bind("change", (event) => {
                        //console.log(combobox.value());
                        state[name] = combobox.value();
                       // console.log(`${name}: ${state[name]}`);
                    });

                    break;
                case 'datepicker':
                    //console.log("Add Listeners: Date Pickers");
     
                    var elementName = "#" + name;
                    var datePicker = $(elementName).data("kendoDatePicker");

                    datePicker.bind("change", (event) => {
                        //console.log(datePicker.value());
                        state[name] = datePicker.value();

                        //console.log(`${name}: ${state[name]}`);
                    });

                    break;
                default:
                    //console.log("Add Listeners: All Other Elements");

                    listener.addEventListener('change', (event) => {
                        //console.log(event);
                        state[name] = listener['value'];

                        //console.log(`${name}: ${state[name]}`);
                    });
            }
        });
    };


    public static render(state:any) {
        console.log("Render PO");
        console.log(state);
    };
}