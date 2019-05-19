///////////////////////////////////////////////////////////////////////////////
//                               Add Card Page                               //
///////////////////////////////////////////////////////////////////////////////

/*
 * The CSS selector of the English card.
 */
const EN_ADD_CARD_SELECTOR = "#card-en-add";

/*
 * The CSS selector of the translated card.
 */
const TL_ADD_CARD_SELECTOR = "#card-tl-add";

/*
 * Requests the translation of TEXT, then calls CALLBACK with the
 * translation as the sole parameter.
 */
function requestTranslation(text, callback) {
  let request = new XMLHttpRequest();
  request.open("GET", `translate?english=${text}`, true);

  // TODO: change Chinese if branny names it something different
  request.onload = () => callback(JSON.parse(request.responseText).Chinese);
  request.onerror = () =>
    alert("There was an error with the translation request.");

  request.send();
}

/*
 * Watches for when the user presses RTN and makes the translation
 * request accordingly.
 * TODO: this name sucks
 */
function addCardKeyDown(event) {
  console.log(event);
  if (event.keyCode == 13) {
    console.log("fuck");
    const input = document.querySelector(EN_ADD_CARD_SELECTOR).value;

    event.preventDefault();
    requestTranslation(input, translation => {
      console.log(`${input}\n${translation}`);
      // TODO: this will be react actually
      document.querySelector(TL_ADD_CARD_SELECTOR).innerText = translation;
    });
  }
}

/*
 * Saves the card to the database.
 */
function saveCard() {
  const en = document.querySelector(EN_ADD_CARD_SELECTOR).value;
  const tl = document.querySelector(TL_ADD_CARD_SELECTOR).innerText;

  let request = new XMLHttpRequest();
  request.open("POST", `store?english=${en}&chinese=${tl}`, true);

  request.onerror = () => alert("There was an error with saving the card.");

  request.send();
}
