import { validateTitleLenght, validatePrice } from './utils.js';
import { clearPristineErrorMessage } from './form.js';

const formElement = document.querySelector('.ad-form');
const advertismentTitleElement = formElement.querySelector('#title');
const advertismentPriceElement = formElement.querySelector('#price');
const advertismentRoomElement = formElement.querySelector('#room_number');
const advertismentGuestElement = formElement.querySelector('#capacity');
const advertismentSliderElement = formElement.querySelector('.ad-form__slider');
const advertismentTypeElement = formElement.querySelector('#type');
const advertismentTimeinElement = formElement.querySelector('#timein');
const advertismentTimeoutElement = formElement.querySelector('#timeout');
const defaultConfig = {
  classTo: 'ad-form__element',
  errorClass: 'has-danger',
  successClass: 'has-success',
  errorTextParent: 'ad-form__element',
  errorTextTag: 'div',
  errorTextClass: 'text-help'
};
const pristine = new Pristine(formElement, defaultConfig);

const selectFieldChangedHandler = () => {
  pristine.validate([advertismentRoomElement, advertismentGuestElement]);
};

const getMessageByValidatePrice = (value) => {
  const type = advertismentTypeElement.value;
  if (type === 'bungalow' && value < 0) {
    return 'Минимальная цена для Бунгало - 0 рублей';
  } else if (type === 'flat' && value < 1000) {
    return 'Минимальная цена для Квартиры- 1000 рублей';
  } else if (type === 'hotel' && value < 3000) {
    return 'Минимальная цена для Отеля - 3000 рублей';
  } else if (type === 'house' && value < 5000) {
    return 'Минимальная цена для Дома - 5000 рублей';
  } else if (type === 'palace' && value < 10000) {
    return 'Минимальная цена для Дворца - 10000 рублей';
  }
};

const validatePriceByType = (value) => {
  const type = advertismentTypeElement.value;
  if (type === 'bungalow' && value >= 0) {
    return true;
  } else if (type === 'flat' && value >= 1000) {
    return true;
  } else if (type === 'hotel' && value >= 3000) {
    return true;
  } else if (type === 'house' && value >= 5000) {
    return true;
  } else if (type === 'palace' && value >= 10000) {
    return true;
  }
};

const setSliderSettings = () => ({
  range: {
    min: 0,
    max: 100000,
  },
  start: 0,
  step: 1,
  connect: 'lower',
  format: {
    to: (value) => value.toFixed(0),
    from: (value) => parseFloat(value),
  },
});

const changePriceHandler = () => {
  advertismentSliderElement.noUiSlider.set(advertismentPriceElement.value);
};

const getSliderOptions = (value) => {
  switch(value) {
    case 'bungalow':
      return {
        range: {
          min: 0,
          max: 100000
        },
        start: 0,
        step: 1
      };
    case 'flat':
      return {
        range: {
          min: 0,
          max: 100000
        },
        start: 1000,
        step: 1
      };
    case 'hotel':
      return {
        range: {
          min: 0,
          max: 100000
        },
        start: 3000,
        step: 1
      };
    case 'house':
      return {
        range: {
          min: 0,
          max: 100000
        },
        start: 5000,
        step: 1
      };
    case 'palace':
      return {
        range: {
          min: 0,
          max: 100000
        },
        start: 10000,
        step: 1
      };
  }
};

const changeTypeHandler = (evt) => {
  clearPristineErrorMessage();
  const value = getSliderOptions(evt.target.value);
  advertismentSliderElement.noUiSlider.updateOptions(value);
  advertismentPriceElement.placeholder = value.start;
};

const setAppropriateTimeinValueHander = () =>{
  const timein = advertismentTimeinElement.value;
  advertismentTimeoutElement.value = timein;
};

const setAppropriateTimeoutValueHander = () => {
  const timeout = advertismentTimeoutElement.value;
  advertismentTimeinElement.value = timeout;
};

const getMessageByValidatingGuestByRoom = () => {
  const roomValue = +advertismentRoomElement.value;
  const guestValue = +advertismentGuestElement.value;
  let message = '';
  if (roomValue === 1 && guestValue !== 1) {
    message = 'Корректный варинат выбора: 1 комната — «для 1 гостя»';
  } else if (roomValue === 2 && (guestValue > 2 || guestValue <= 1)) {
    message = 'Корректный варинат выбора: 2 комнаты — «для 2 гостей» или «для 1 гостя»;';
  } else if (roomValue === 3 && (guestValue > 3 || guestValue <= 1)) {
    message = 'Корректный варинат выбора: 3 комнаты — «для 3 гостей», «для 2 гостей» или «для 1 гостя»';
  } else if (roomValue === 100 && guestValue !== 0){
    message = 'Корректный варинат выбора: 100 комнат — «не для гостей»';
  }
  return message;
};

const validateGuestsByRoom = () => {
  const roomValue = +advertismentRoomElement.value;
  const guestValue = +advertismentGuestElement.value;
  const roomForGuest = (roomValue === 1 && guestValue === 1);
  const twoRoomsForGuests = (roomValue === 2  && (guestValue <= 2 && guestValue > 0));
  const threeRoomsForGuests = (roomValue === 3  && (guestValue <= 3 && guestValue > 0));
  const hundredRoomsNotForGuests = (roomValue === 100 && guestValue === 0);
  const isMatched = roomForGuest || twoRoomsForGuests || threeRoomsForGuests || hundredRoomsNotForGuests;
  return isMatched;
};

const validFieldsByPristine = () =>{
  pristine.addValidator(
    advertismentRoomElement,
    validateGuestsByRoom,
    getMessageByValidatingGuestByRoom
  );

  pristine.addValidator(
    advertismentGuestElement,
    validateGuestsByRoom,
    getMessageByValidatingGuestByRoom
  );

  pristine.addValidator(
    advertismentTitleElement,
    validateTitleLenght,
    'Длина не меньше 30 и не больше 100 символов'
  );

  pristine.addValidator(
    advertismentPriceElement,
    validatePrice,
    'Максимальное значение — 100000'
  );

  pristine.addValidator(
    advertismentPriceElement,
    validatePriceByType,
    getMessageByValidatePrice
  );
};

advertismentRoomElement.addEventListener('change', selectFieldChangedHandler);
advertismentGuestElement.addEventListener('change', selectFieldChangedHandler);
validFieldsByPristine();

noUiSlider.create(advertismentSliderElement, setSliderSettings());
advertismentSliderElement.noUiSlider.on('update', () => {
  advertismentPriceElement.value = advertismentSliderElement.noUiSlider.get();
});

advertismentPriceElement.addEventListener('change', changePriceHandler);
advertismentTypeElement.addEventListener('change', changeTypeHandler);
advertismentTimeinElement.addEventListener('change', setAppropriateTimeinValueHander);
advertismentTimeoutElement.addEventListener('change', setAppropriateTimeoutValueHander);

export { pristine };
