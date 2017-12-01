import { BlurEvent, CheckboxInput, CheckedInputChangeEvent, FocusEvent, StyleEvent } from '../../utils/input-interfaces';
import { Component, CssClassMap, Event, EventEmitter, Prop, PropDidChange, State } from '@stencil/core';


@Component({
  tag: 'ion-checkbox',
  styleUrls: {
    ios: 'checkbox.ios.scss',
    md: 'checkbox.md.scss'
  },
  host: {
    theme: 'checkbox'
  }
})
export class Checkbox implements CheckboxInput {
  private didLoad: boolean;
  private inputId: string;
  private nativeInput: HTMLInputElement;
  private styleTmr: any;

  @State() keyFocus: boolean;

  /**
   * @input {string} The color to use from your Sass `$colors` map.
   * Default options are: `"primary"`, `"secondary"`, `"danger"`, `"light"`, and `"dark"`.
   * For more information, see [Theming your App](/docs/theming/theming-your-app).
   */
  @Prop() color: string;

  /**
   * @input {string} The mode determines which platform styles to use.
   * Possible values are: `"ios"` or `"md"`.
   * For more information, see [Platform Styles](/docs/theming/platform-specific-styles).
   */
  @Prop() mode: 'ios' | 'md';

  /**
   * The name of the control, which is submitted with the form data.
   */
  @Prop() name: string;

  /**
   * @input {boolean} If true, the checkbox is selected. Defaults to `false`.
   */
  @Prop({ mutable: true }) checked = false;

  /*
   * @input {boolean} If true, the user cannot interact with the checkbox. Default false.
   */
  @Prop() disabled = false;

  /**
   * @input {string} the value of the checkbox.
   */
  @Prop({ mutable: true }) value: string;

  /**
   * @output {Event} Emitted when the checked property has changed.
   */
  @Event() ionChange: EventEmitter<CheckedInputChangeEvent>;

  /**
   * @output {Event} Emitted when the toggle has focus.
   */
  @Event() ionFocus: EventEmitter<FocusEvent>;

  /**
   * @output {Event} Emitted when the toggle loses focus.
   */
  @Event() ionBlur: EventEmitter<BlurEvent>;

  /**
   * @output {Event} Emitted when the styles change.
   */
  @Event() ionStyle: EventEmitter<StyleEvent>;


  componentWillLoad() {
    this.inputId = 'ion-cb-' + (checkboxIds++);
    if (this.value === undefined) {
      this.value = this.inputId;
    }
    this.emitStyle();
  }

  componentDidLoad() {
    this.nativeInput.checked = this.checked;
    this.didLoad = true;

    const parentItem = this.nativeInput.closest('ion-item');
    if (parentItem) {
      const itemLabel = parentItem.querySelector('ion-label');
      if (itemLabel) {
        itemLabel.id = this.inputId + '-lbl';
        this.nativeInput.setAttribute('aria-labelledby', itemLabel.id);
      }
    }
  }

  @PropDidChange('checked')
  checkedChanged(isChecked: boolean) {
    if (this.nativeInput.checked !== isChecked) {
      // keep the checked value and native input `nync
      this.nativeInput.checked = isChecked;
    }
    if (this.didLoad) {
      this.ionChange.emit({
        checked: isChecked,
        value: this.value
      });
    }
    this.emitStyle();
  }

  @PropDidChange('disabled')
  disabledChanged(isDisabled: boolean) {
    this.nativeInput.disabled = isDisabled;
    this.emitStyle();
  }

  emitStyle() {
    clearTimeout(this.styleTmr);

    this.styleTmr = setTimeout(() => {
      this.ionStyle.emit({
        'checkbox-disabled': this.disabled,
        'checkbox-checked': this.checked,
      });
    });
  }

  onChange() {
    this.checked = !this.checked;
  }

  onKeyUp() {
    this.keyFocus = true;
  }

  onFocus() {
    this.ionFocus.emit();
  }

  onBlur() {
    this.keyFocus = false;
    this.ionBlur.emit();
  }

  hostData() {
    return {
      class: {
        'checkbox-checked': this.checked,
        'checkbox-disabled': this.disabled,
        'checkbox-key': this.keyFocus
      }
    };
  }

  render() {
    const checkboxClasses: CssClassMap = {
      'checkbox-icon': true,
      'checkbox-checked': this.checked
    };

    return [
      <div class={checkboxClasses}>
        <div class='checkbox-inner'></div>
      </div>,
      <input
        type='checkbox'
        onChange={this.onChange.bind(this)}
        onFocus={this.onFocus.bind(this)}
        onBlur={this.onBlur.bind(this)}
        onKeyUp={this.onKeyUp.bind(this)}
        id={this.inputId}
        name={this.name}
        value={this.value}
        disabled={this.disabled}
        ref={r => this.nativeInput = (r as any)}/>
    ];
  }
}

let checkboxIds = 0;