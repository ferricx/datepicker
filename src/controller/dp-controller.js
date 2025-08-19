import "../style/style.scss";

class DatepickerDialog extends HTMLElement {
  static get observedAttributes(){
    return ['input-name', 'input-class-string', 'label-string', 'required', 'min-date', 'max-date']
  }
  
  constructor() {
    super();
  }

  connectedCallback(){
    this.init();
  }

  async init(){
    // this.attachShadow({mode: 'open'});
    await this.gettemplate();
    const dlogTemplate = document.getElementById('datepicker-template');
    this.appendChild(dlogTemplate.content.cloneNode(true));
 
    this.buttonLabelChoose = 'Choose Date';
    this.buttonLabelChange = 'Change Date';
    this.dayLabels = [];
    this.dayLabelsShort = [];
    this.monthLabels = [];
    
    const daysLongFormatter = new Intl.DateTimeFormat('en-us', { weekday: 'long' });
    const daysShortFormatter = new Intl.DateTimeFormat('en-us', {weekday: 'short'});
    const monthsLongFormatter = new Intl.DateTimeFormat('en-us', {month: 'long'});
    
    for (let i = 0; i < 7; i++) {
       const date = new Date(2023, 0, 1 + i); // 1 + i ensures we get Sunday, Monday...
        this.dayLabels.push(daysLongFormatter.format(date));
        this.dayLabelsShort.push(daysShortFormatter.format(date));
    }
      for (let i = 1; i < 360; i += 32) {
       const date = new Date(2023, 0, 1 + i); // 1 + i ensures we get Sunday, Monday...
        this.monthLabels.push(monthsLongFormatter.format(date));
    }
    
    this.messageCursorKeys = 'Cursor keys can navigate dates';
    this.lastMessage = '';

    console.log("set the nodes");
    this.inputLabelNode = this.querySelector("label");
    this.textboxNode = this.querySelector('input[type="text"]');
    this.setInputName();
    this.buttonNode = this.querySelector('.group button');
    this.dialogNode = this.querySelector('dialog');
    this.dialogNodeContent = this.dialogNode.querySelector(".dlog-content");
    this.messageNode = this.dialogNode.querySelector('.dialog-message');

    this.monthYearNode = this.dialogNode.querySelector('.month-year');

    this.prevYearNode = this.dialogNode.querySelector('.prev-year');
    this.prevMonthNode = this.dialogNode.querySelector('.prev-month');
    this.nextMonthNode = this.dialogNode.querySelector('.next-month');
    this.nextYearNode = this.dialogNode.querySelector('.next-year');

    this.okButtonNode = this.dialogNode.querySelector('button[value="ok"]');
    this.cancelButtonNode = this.dialogNode.querySelector(
      'button[value="cancel"]'
    );
    
    this.tbodyNode = this.dialogNode.querySelector('.table.dates .table__body');
    this.theadNode = this.dialogNode.querySelector('.table.dates .table__head');
    
    this.lastRowNode = null;
  
    this.days = [];

    this.focusDay = new Date();
    this.oldDay = this.focusDay;
    this.selectedDay = new Date(0, 0, 1);

    this.lastDate = -1;

    this.isMouseDownOnBackground = false;
    
    
    this.theadNode.innerHTML = '';

    this.createMonthGrid();
  }

  attributeChangedCallback(name, oldValue, newValue){
    console.log("name - " + name, "nv - " + newValue);
    switch (name){
      case 'input-name':
      this.inputName = newValue;
      break; 
    }
  }

setInputNode(){
  console.log("set input name");
  this.textboxNode = this.querySelector("input[type=text]");
}

getTextboxNode(){return this.querySelector("input[type=text]");}
getTextboxLabelNode(){return this.querySelector("label");}

setInputName(name){
  this.textboxNode.id=this.inputName;
  this.textboxNode.name=this.inputName;
  
  this.inputLabelNode.setAttribute("for", this.inputName);
}

  createMonthGrid(){
    console.log("createmonthgrid");
    // const row = this.theadNode.insertRow();
    for (let i = 0; i<7; i++){
      const cell = document.createElement('div');
      cell.classList.add("table__head__cell");
      cell.innerText = this.dayLabelsShort[i];
      
      this.theadNode.appendChild(cell);
    }
    
    // Create Grid of Dates

    this.tbodyNode.innerHTML = '';
    
       const indicator = document.createElement("div");
    indicator.classList.add("focus-indicator");
    this.tbodyNode.appendChild(indicator);
    // for (let i = 0; i < 6; i++) {
      // this.lastRowNode = row;
      for (let j = 0; j < 42; j++) {
        const cell = document.createElement('div');
        cell.classList.add("grid-cell");
        cell.style = `--is: --anchor-${j}`;
        cell.tabIndex = -1;
        cell.addEventListener('click', this.handleDayClick.bind(this));
        cell.addEventListener('keydown', this.handleDayKeyDown.bind(this));
        cell.addEventListener('focus', this.handleDayFocus.bind(this));

        cell.textContent = '-1';

        this.tbodyNode.appendChild(cell);
        this.days.push(cell);
      }
    
    this.setDropdowns();
    this.updateGrid();
    this.close(false);
    this.setDateForButtonLabel();
    this.addEventListeners();
  }
    
  set targetElement(element) {
    if (element instanceof HTMLElement) {
      this._targetElement = element;
      // this.shadowRoot.innerHTML = `<p>Target element's ID: ${element.id}</p>`;
      // You can now use this._targetElement within your component
    } else {
      console.warn("Invalid element provided to targetElement property.");
    }
  }
  
   get targetElement() {
    return this._targetElement;
  }

  async gettemplate(){
    const tmplt = await fetch("/node_modules/datepicker-web-component/src/template/dp-template.html");
    const tmplHtml = await tmplt.text();
          const parser = new DOMParser();
    const doc = parser.parseFromString(tmplHtml, 'text/html');
    const template = doc.querySelector("template");
    document.body.appendChild(template);

    console.log(document.getElementById("datepicker-template"));

  }

  setDropdowns(){
    
  }
  
  addEventListeners(){
    console.log(this.dialogNode);
    this.dialogNode.addEventListener("beforetoggle", (e) => {
      console.log("beforeToggle", e.newState);
          const datepickerOpen = new CustomEvent('datepickerToggle', 
       {
        composed: true,
        detail: {
          status: e.newState
        }
      });
      this.dispatchEvent(datepickerOpen);
    });
    this.textboxNode.addEventListener(
      'blur',
      this.setDateForButtonLabel.bind(this)
    );

    this.buttonNode.addEventListener(
      'keydown',
      this.handleButtonKeydown.bind(this)
    );
    this.buttonNode.addEventListener(
      'click',
      this.handleButtonClick.bind(this)
    );

    this.okButtonNode.addEventListener('click', this.handleOkButton.bind(this));
    this.okButtonNode.addEventListener(
      'keydown',
      this.handleOkButton.bind(this)
    );

    this.cancelButtonNode.addEventListener(
      'click',
      this.handleCancelButton.bind(this)
    );
    this.cancelButtonNode.addEventListener(
      'keydown',
      this.handleCancelButton.bind(this)
    );

    this.prevMonthNode.addEventListener(
      'click',
      this.handlePreviousMonthButton.bind(this)
    );
    this.nextMonthNode.addEventListener(
      'click',
      this.handleNextMonthButton.bind(this)
    );
    
    this.prevYearNode.addEventListener(
      'click',
      this.handlePreviousYearButton.bind(this)
    );
    this.nextYearNode.addEventListener(
      'click',
      this.handleNextYearButton.bind(this)
    );

    this.prevMonthNode.addEventListener(
      'keydown',
      this.handlePreviousMonthButton.bind(this)
    );
    this.nextMonthNode.addEventListener(
      'keydown',
      this.handleNextMonthButton.bind(this)
    );
    this.prevYearNode.addEventListener(
      'keydown',
      this.handlePreviousYearButton.bind(this)
    );
    this.nextYearNode.addEventListener(
      'keydown',
      this.handleNextYearButton.bind(this)
    );

    this.dialogNode.addEventListener(
      'pointerup',
      this.handleBackgroundMouseUp.bind(this),
      true
    );
  }
  
  isSameDay(day1, day2) {
    return (
      day1.getFullYear() == day2.getFullYear() &&
      day1.getMonth() == day2.getMonth() &&
      day1.getDate() == day2.getDate()
    );
  }

  isNotSameMonth(day1, day2) {
    return (
      day1.getFullYear() != day2.getFullYear() ||
      day1.getMonth() != day2.getMonth()
    );
  }

  updateGrid() {
    const fd = this.focusDay;

    this.monthYearNode.textContent =
      this.monthLabels[fd.getMonth()] + ' ' + fd.getFullYear();

    let firstDayOfMonth = new Date(fd.getFullYear(), fd.getMonth(), 1);
    let dayOfWeek = firstDayOfMonth.getDay();

    firstDayOfMonth.setDate(firstDayOfMonth.getDate() - dayOfWeek);

    const d = new Date(firstDayOfMonth);

    for (let i = 0; i < this.days.length; i++) {
      const flag = d.getMonth() != fd.getMonth();
      this.updateDate(
        this.days[i],
        flag,
        d,
        this.isSameDay(d, this.selectedDay)
      );
      d.setDate(d.getDate() + 1);

      // Hide last row if all dates are disabled (e.g. in next month)
      if (i === 35) {
        if (flag) {
      //    this.lastRowNode.style.visibility = 'hidden';
        } else {
        //  this.lastRowNode.style.visibility = 'visible';
        }
      }
    }
  }

  updateDate(domNode, disable, day, selected) {
    let d = day.getDate().toString();
    if (day.getDate() <= 9) {
      d = '0' + d;
    }

    let m = day.getMonth() + 1;
    if (day.getMonth() < 9) {
      m = '0' + m;
    }

    // domNode.tabIndex = -1;
    domNode.removeAttribute('aria-selected');
    domNode.setAttribute('data-date', day.getFullYear() + '-' + m + '-' + d);

    if (disable) {
      domNode.classList.add('disabled');
      domNode.innerHTML = '&nbsp;';
    } else {
      domNode.classList.remove('disabled');
      domNode.textContent = day.getDate();
      if (selected) {
        domNode.setAttribute('aria-selected', 'true');
        domNode.tabIndex = 0;
      } else {
        domNode.tabIndex = -1;
      }
    }
  }
  
  moveFocusToDay(day) {
    const d = this.focusDay;
    this.oldDay = this.focusDay;
    this.focusDay = day;

    if (
      d.getMonth() != this.focusDay.getMonth() ||
      d.getFullYear() != this.focusDay.getFullYear()
    ) {
      this.updateGrid();
    }
    this.setFocusDay();
  }

  setFocusDay(flag) {
    if (typeof flag !== 'boolean') {
      flag = true;
    }
    let oldDayIndex = 0;
    for (let i = 0; i < this.days.length; i++) {
      const dayNode = this.days[i];
      const day = this.getDayFromDataDateAttribute(dayNode);
      
      if(!this.isSameDay(day, this.oldDay)){
        dayNode.tabIndex = -1;
      } else {
        if(!this.isSameDay(this.oldDay, this.focusDay)){
        oldDayIndex = i;
      }
      }
      if (this.isSameDay(day, this.focusDay)) {
        dayNode.tabIndex = 0;
        if (flag) {
          dayNode.focus();
        }
      }
    }
 
    if(oldDayIndex){
      this.days[oldDayIndex].tabIndex=-1;
    }
  }

  open() {
    console.log("open dpdl");
        const datepickerOpen = new CustomEvent('datepickerToggle', 
       {
        composed: true,
        detail: {
          status: "open"
        }
      });
                                            
      this.dispatchEvent(datepickerOpen);
    
    this.dialogNode.showModal();
    this.getDateFromTextbox();
    this.updateGrid();
    this.lastDate = this.focusDay.getDate();
  }

  isOpen() {
    return this.dialogNode.open
  }

  close(flag) {
    this.dialogNode.close(flag);
    if (typeof flag !== 'boolean') {
      // Default is to move focus to combobox
         this.buttonNode.focus();
      
    }
    this.setMessage('');
  }

  changeMonth(currentDate, numMonths) {
    const getDays = (year, month) => new Date(year, month, 0).getDate();

    const isPrev = numMonths < 0;
    const numYears = Math.trunc(Math.abs(numMonths) / 12);
    numMonths = Math.abs(numMonths) % 12;

    const newYear = isPrev
      ? currentDate.getFullYear() - numYears
      : currentDate.getFullYear() + numYears;

    const newMonth = isPrev
      ? currentDate.getMonth() - numMonths
      : currentDate.getMonth() + numMonths;

    const newDate = new Date(newYear, newMonth, 1);

    const daysInMonth = getDays(newDate.getFullYear(), newDate.getMonth() + 1);

    this.lastDate = this.lastDate ? this.lastDate : currentDate.getDate();

    if (this.lastDate > daysInMonth) {
      newDate.setDate(daysInMonth);
    } else {
      newDate.setDate(this.lastDate);
    }

    return newDate;
  }

  moveToNextYear() {
    this.focusDay = this.changeMonth(this.focusDay, 12);
    this.updateGrid();
  }

  moveToPreviousYear() {
    this.focusDay = this.changeMonth(this.focusDay, -12);
    this.updateGrid();
  }

  moveToNextMonth() {
    this.focusDay = this.changeMonth(this.focusDay, 1);
    this.updateGrid();
  }

  moveToPreviousMonth() {
    this.focusDay = this.changeMonth(this.focusDay, -1);
    this.updateGrid();
  }

  moveFocusToNextDay() {
    const d = new Date(this.focusDay);
    d.setDate(d.getDate() + 1);
    this.lastDate = d.getDate();
    this.moveFocusToDay(d);
  }

  moveFocusToNextWeek() {
    const d = new Date(this.focusDay);
    d.setDate(d.getDate() + 7);
    this.lastDate = d.getDate();
    this.moveFocusToDay(d);
  }

  moveFocusToPreviousDay() {
    const d = new Date(this.focusDay);
    d.setDate(d.getDate() - 1);
    this.lastDate = d.getDate();
    this.moveFocusToDay(d);
  }

  moveFocusToPreviousWeek() {
    const d = new Date(this.focusDay);
    d.setDate(d.getDate() - 7);
    this.lastDate = d.getDate();
    this.moveFocusToDay(d);
  }

  moveFocusToFirstDayOfWeek() {
    const d = new Date(this.focusDay);
    d.setDate(d.getDate() - d.getDay());
    this.lastDate = d.getDate();
    this.moveFocusToDay(d);
  }

  moveFocusToLastDayOfWeek() {
    const d = new Date(this.focusDay);
    d.setDate(d.getDate() + (6 - d.getDay()));
    this.lastDate = d.getDate();
    this.moveFocusToDay(d);
  }

  // Day methods

  isDayDisabled(domNode) {
    return domNode.classList.contains('disabled');
  }

  getDayFromDataDateAttribute(domNode) {
    const parts = domNode.getAttribute('data-date').split('-');
    return new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
  }

  // Textbox methods

  setTextboxDate(domNode) {
    let d = this.focusDay;

    if (domNode) {
      d = this.getDayFromDataDateAttribute(domNode);
      // updated aria-selected
      this.days.forEach((day) =>
        day === domNode
          ? day.setAttribute('aria-selected', 'true')
          : day.removeAttribute('aria-selected')
      );
    }

    this.textboxNode.value =
      d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();
    this.setDateForButtonLabel();
  }

  getDateFromTextbox() {
    const dateparts = this.textboxNode.value.split('/');
    const month = parseInt(dateparts[0]);
    const day = parseInt(dateparts[1]);
    let year = parseInt(dateparts[2]);

    if (
      dateparts.length === 3 &&
      Number.isInteger(month) &&
      Number.isInteger(day) &&
      Number.isInteger(year)
    ) {
      if (year < 100) {
        year = 2000 + year;
      }
      this.focusDay = new Date(year, month - 1, day);
      this.selectedDay = new Date(this.focusDay);
    } else {
      // If not a valid date (MM/DD/YY) initialize with todays date
      this.focusDay = new Date();
      this.selectedDay = new Date(0, 0, 1);
    }
  }

  setDateForButtonLabel() {
    const dateparts = this.textboxNode.value.split('/');

    if (
      dateparts.length === 3 &&
      Number.isInteger(parseInt(dateparts[0])) &&
      Number.isInteger(parseInt(dateparts[1])) &&
      Number.isInteger(parseInt(dateparts[2]))
    ) {
      const day = new Date(
        parseInt(dateparts[2]),
        parseInt(dateparts[0]) - 1,
        parseInt(dateparts[1])
      );
      //this is where we set the aria
      let label = this.buttonLabelChange;
      label += ', ' + this.dayLabels[day.getDay()];
      label += ' ' + this.monthLabels[day.getMonth()];
      label += ' ' + day.getDate();
      label += ', ' + day.getFullYear();
      this.buttonNode.setAttribute('aria-label', label);
    } else {
      this.buttonNode.setAttribute('aria-label', this.buttonLabelChoose);
    }
  }

  setMessage(str) {
    function setMessageDelayed() {
      this.messageNode.textContent = str;
    }

    if (str !== this.lastMessage) {
      setTimeout(setMessageDelayed.bind(this), 200);
      this.lastMessage = str;
    }
  }

  // Event handlers
  handleOkButton(event) {
    let flag = false;

    switch (event.type) {
      case 'keydown':
        switch (event.key) {
          case 'Tab':
            // if (!event.shiftKey) {
            //   this.prevYearNode.focus();
            //   flag = true;
            // }
            break;

          default:
            break;
        }
        break;

      case 'click':
        this.setTextboxDate();
        this.close();
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  handleCancelButton(event) {
    switch (event.type) {
      case 'click':
        this.close();
        event.stopPropagation();
        event.preventDefault();
        break;

      default:
        break;
    }
  }

  handleNextYearButton(event) {
    let flag = false;
    switch (event.type) {
      case 'keydown':
        switch (event.key) {
          case 'Enter':
            this.moveToNextYear();
            this.setFocusDay(false);
            flag=true;
            break;
        }
        break;

      case 'click':
        this.moveToNextYear();
        this.setFocusDay(false);
        flag=true;
        break;

      default:
        break;
    }
    if(flag){
      event.stopPropagation();
      event.preventDefault();
    }
  }

  handlePreviousYearButton(event) {
    let flag = false;

    switch (event.type) {
      case 'keydown':
        switch (event.key) {
          case 'Enter':
            this.moveToPreviousYear();
            this.setFocusDay(false);

            flag = true;
            break;

          case 'Tab':
            if (event.shiftKey) {
              this.okButtonNode.focus();
              flag = true;
            }
            break;

          default:
            break;
        }

        break;

      case 'click':
        this.moveToPreviousYear();
        
        this.setFocusDay(false);
        flag=true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }

  handleNextMonthButton(event) {
    switch (event.type) {
      case 'keydown':
        switch (event.key) {
          case 'Enter':
            this.moveToNextMonth();
            this.setFocusDay(false);
            event.stopPropagation();
            event.preventDefault();
            break;
        }

        break;

      case 'click':
        this.moveToNextMonth();
        this.setFocusDay(false);
        break;

      default:
        break;
    }
  }

  handlePreviousMonthButton(event) {
    let flag = false;

    switch (event.type) {
      case 'keydown':
        switch (event.key) {
          case 'Esc':
          case 'Escape':
            this.close();
            flag = true;
            break;

          case 'Enter':
            this.moveToPreviousMonth();
            this.setFocusDay(false);
            flag = true;
            break;
        }

        break;

      case 'click':
        this.moveToPreviousMonth();
        this.setFocusDay(false);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  handleDayKeyDown(event) {
    let flag = false;
    
    switch (event.code) {
      case 'Tab':
        this.cancelButtonNode.focus();
        if (event.shiftKey) {
          this.nextYearNode.focus();
        }
        this.setMessage('');
        flag = true;
        break;

      case 'Right':
      case 'ArrowRight':
        this.moveFocusToNextDay();
        flag = true;
        break;

      case 'Left':
      case 'ArrowLeft':
        this.moveFocusToPreviousDay();
        flag = true;
        break;

      case 'Down':
      case 'ArrowDown':
        this.moveFocusToNextWeek();
        flag = true;
        break;

      case 'Up':
      case 'ArrowUp':
        this.moveFocusToPreviousWeek();
        flag = true;
        break;

      case 'PageUp':
        if (event.shiftKey) {
          this.moveToPreviousYear();
        } else {
          this.moveToPreviousMonth();
        }
        this.setFocusDay();
        flag = true;
        break;

      case 'PageDown':
        if (event.shiftKey) {
          this.moveToNextYear();
        } else {
          this.moveToNextMonth();
        }
        this.setFocusDay();
        flag = true;
        break;

      case 'Home':
        this.moveFocusToFirstDayOfWeek();
        flag = true;
        break;

      case 'End':
        this.moveFocusToLastDayOfWeek();
        flag = true;
        break;
      case 'Space':
        case 'Enter':
        
        this.handleDayClick(event);
        this.setTextboxDate(event.currentTarget);
        flag = true;
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  handleDayClick(event) {
    if (!this.isDayDisabled(event.currentTarget) && event.which !== 3) {
      this.setTextboxDate(event.currentTarget);
      this.close();
    }
    
    event.stopPropagation();
    event.preventDefault();
  }

  handleDayFocus() {
    this.setMessage(this.messageCursorKeys);
  }

  handleButtonKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.open();
      this.setFocusDay();

      event.stopPropagation();
      event.preventDefault();
    }
  }

  handleButtonClick(event) {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
      this.setFocusDay();
    }

    event.stopPropagation();
    event.preventDefault();
  }

  handleBackgroundMouseUp(event) {
      if (event.target === this.dialogNode && this.isOpen()) {
        this.close(false);
        event.stopPropagation();
        event.preventDefault();
      }
  }
}


export {DatepickerDialog};

customElements.define('dlog-datepicker', DatepickerDialog);

document.addEventListener('DOMContentLoaded', () => {
  console.log("dlog-datepicker check");

// fetch('https://codepen.io/ferricx/pen/yyYgrXz.html')
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//   // const dp = new Do
//   const htmlText = response.text();
//     return htmlText;
//   })
//   .then(html => {
// // console.log(html);
//   // const htmlElement = (new DOMParser()).parseFromString(html, "text/html");
  
//   const ele = document.getElementById('datepicker-template');
  
//   if(!ele){
//     console.error("no dlog-template element found. Add this to your code to use this component.");
//   } else {
//   ele.innerHTML = html;

//   customElements.define('dlog-datepicker', DatePickerDialog);
    
//   }
//   })
//   .catch(e => {
//     console.error('There was a problem with the fetch operation:', e);
//   });

  const dialogDatepicker = document.querySelector('dlog-datepicker');

  if(dialogDatepicker) {
//       const shadowRoot = dialogDatepicker.shadowRoot;
//       const dlogElement = shadowRoot.querySelector('dialog');
      dialogDatepicker.addEventListener("datepickerToggle", e =>{
        console.log(e.detail.status);
        if(e.detail.status === "open"){
        document.body.classList.add("dialog-open");
          console.log(document.body);
        } else {
          document.body.classList.remove("dialog-open");
        }
    });
  }
});