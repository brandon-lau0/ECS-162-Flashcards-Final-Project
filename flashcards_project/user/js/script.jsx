///////////////////////////////////////////////////////////////////////////////
//                          welcome to my messy code                         //
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//                                   Common                                  //
///////////////////////////////////////////////////////////////////////////////
class TopButton extends React.Component {
  // PROPS should contain the button text and an onClick function
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <button
        id={this.props.id}
        className="helvetica white-fg dark-purple-bg"
        onClick={this.props.onClick}
      >
        {this.props.text}
      </button>
    );
  }
}

/*
 * Component for the top part of the screen (title + button).
 * No updates needed for this one.
 */
class TitleBar extends React.Component {
  // PROPS should contain buttonText, onClick, and horizontal padding class
  constructor(props) {
    super(props);
  }

  render() {
    return (
      // since the padding changes between views
      <section className={`titlebar ${this.props.paddingClass}`}>
        <div className="titlebar-format">
          <TopButton
            id={this.props.buttonId}
            text={this.props.buttonText}
            onClick={this.props.buttonOnClick}
          />
        </div>
        <h3 className="raleway dark-purple-fg">Lango!</h3>
        <div className="titlebar-format" />
      </section>
    );
  }
}

/*
 * Component for the username bar at the bottom.
 */
class UsernameBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "Username" };
  }

  componentDidMount() {
    let request = new XMLHttpRequest();
    request.open("GET", "/username", true);

    request.onload = () => {
      let response = JSON.parse(request.responseText);
      this.setState({ username: response.username });
    };

    request.onerror = () => {
      alert("There was an error with requesting user information.");
    };

    request.send();
  }

  render() {
    return (
      <aside className="user-add helvetica white-fg dark-purple-bg">
        <div>{this.state.username}</div>
      </aside>
    );
  }
}

///////////////////////////////////////////////////////////////////////////////
//                               Addition Page                                //
///////////////////////////////////////////////////////////////////////////////
/*
 * Requests the translation of TEXT, then calls CALLBACK with the
 * translation as the sole parameter.
 */
function requestTranslation(text, callback) {
  let request = new XMLHttpRequest();
  request.open("GET", `/translate?english=${text}`, true);

  request.onload = () => callback(JSON.parse(request.responseText).Chinese);
  request.onerror = () =>
    alert("There was an error with the translation request.");

  request.send();
}

/*
 * Requests to save a card with EN English text and TL translation
 * text to the database.
 */
function saveCard(en, tl) {
  let request = new XMLHttpRequest();
  request.open("POST", `/store?english=${en}&chinese=${tl}`, true);

  request.onerror = () => alert("There was an error with saving the card.");

  request.send();
}

/*
 * Component for the English input and translation output cards with
 * button. Two items in one component.
 *
 * We could've extracted the button into a separate component, but
 * I decided it would be too much effort, even though that would give
 * us less React/CSS duplication and cleaner code.
 */
class CreationCards extends React.Component {
  constructor(props) {
    super(props);
    this.state = { inputStyle: this.inputStyle(), tlText: undefined };
  }

  render() {
    const inputElement = document.getElementById(this.props.inputId);
    const input = inputElement && inputElement.value;
    // show grey if no input
    const tlColor = input && this.state.tlText ? "black-fg" : "grey-fg";

    return [
      // we could've used a wrapper instead of an array, but it's too late now
      <section key="0" className="card-add">
        <figure className="card-add">
          <textarea
            id={this.props.inputId}
            className="helvetica"
            type="text"
            placeholder="English"
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp}
            style={this.state.inputStyle}
          />
        </figure>
        <figure className="card-add">
          <span id={this.props.outputId} className={`helvetica ${tlColor}`}>
            {this.state.tlText || "Translation"}
          </span>
        </figure>
      </section>,
      <div key="1" className="save-button">
        <button
          className="action-button helvetica white-fg green-bg"
          onClick={this.onClick}
        >
          Save
        </button>
      </div>
    ];
  }

  /*
   * Generates the inline styling for the input text.
   */
  inputStyle() {
    const inputElement = document.getElementById(this.props.inputId);
    const inputStyle = { boxSizing: "border-box" };
    let dummy;

    if (inputElement) {
      dummy = inputElement.cloneNode();
      dummy.value = inputElement.value;

      dummy.style.width = window.getComputedStyle(inputElement).width;
    } else {
      dummy = document.createElement("textarea");
      dummy.value = "branny";

      dummy.id = this.props.inputId; // same as what the input card would have
      dummy.classList.add("helvetica");
    }

    dummy.style.height = "1px";
    dummy.style.visibility = "hidden";

    document.body.appendChild(dummy);

    inputStyle.height = dummy.scrollHeight;

    document.body.removeChild(dummy);

    return inputStyle;
  }

  /*
   * Watches for when the user presses RET and makes the translation
   * request accordingly.
   */
  onKeyDown = event => {
    if (event.key == "Enter") {
      const input = document.getElementById(this.props.inputId).value;

      event.preventDefault();
      requestTranslation(input.trim(), translation => {
        this.setState({ tlText: translation });
      });
    }
  };

  /*
   * Watches for a key press and resizes the input box accordingly.
   */
  onKeyUp = _ => {
    this.setState({ inputStyle: this.inputStyle() });

    // it's okay to modify value, since it's not managed by react
    if (document.getElementById(this.props.inputId).value == "") {
      this.setState({ tlText: "" });
    }
  };

  /*
   * Makes a request to save the card.
   */
  onClick = () => {
    console.log(this.props);
    const en = document.getElementById(this.props.inputId).value;
    const tl = document.getElementById(this.props.outputId).innerText;

    // trim tl just in case
    saveCard(en.trim(), tl.trim());

    document.getElementById(this.props.inputId).value = "";
    this.setState({ tlText: "" });
  };
}

///////////////////////////////////////////////////////////////////////////////
//                                Review Page                                //
///////////////////////////////////////////////////////////////////////////////
// NOTE: because some of this is third-party code, any code related to
// reviewing will be generally unclean and monkey-patched because I
// don't have the time to actually look through and understand what
// the hell the example is doing.

/*
 * React component for the front of the card.
 * https://reactjsexample.com/react-flipping-card-with-tutorial/
 */
class ReviewCardFront extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="card-side side-front">
        <div className="flip-icon">
          <img src="assets/refresh.png" />
        </div>
        <div className="card-side-container">
          <h2 id="trans">{this.props.text}</h2>
        </div>
      </div>
    );
  }
}

/*
 * React component for the green correct box.
 */
class ReviewCorrect extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // TODO: correct box
    return (
      <div className="review-correct helvetica">
        <span>CORRECT!</span>
      </div>
    );
  }
}
/*
 * React component for the back side of the card.
 * https://reactjsexample.com/react-flipping-card-with-tutorial/
 */
class ReviewCardBack extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="card-side side-back">
        <div className="flip-icon">
          <img src="assets/refresh.png" />
        </div>
        <div className="card-side-container">
          {this.props.correct ? (
            <ReviewCorrect />
          ) : (
            <h2 id="congrats">{this.props.text}</h2>
          )}
        </div>
      </div>
    );
  }
}

/*
 * React component for the overall review card.
 * https://reactjsexample.com/react-flipping-card-with-tutorial/
 */
class ReviewCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        className={`helvetica card-container ${
          this.props.flipped ? "card-container-flip" : ""
        }`}
      >
        <div className="card-body">
          <ReviewCardBack
            text={this.props.backText}
            // TODO:
            correct={this.props.correct}
          />
          <ReviewCardFront text={this.props.frontText} />
        </div>
      </div>
    );
  }
}

/*
 * Component for review cards + button.
 * This could be a mini god-object I swear.
 */
class ReviewCards extends React.Component {
  // PROPS should contain textId and inputId
  constructor(props) {
    super(props);
    this.state = { card: undefined, flipped: false };
  }

  componentDidMount() {
    this.requestCard();
  }

  render() {
    // There's absolutely no point in using the given CardTextarea
    // because it's literally just a textarea. If anything, it'll
    // be a headache.
    return (
      <section className="card-review">
        <div id="flip-card" onClick={this.cardOnClick}>
          <ReviewCard
            frontText={
              (this.state.card && this.state.card.translatedText) ||
              "Loading..."
            }
            backText={
              (this.state.card && this.state.card.englishText) || "Loading..."
            }
            correct={this.correct()}
            flipped={this.state.flipped}
          />
        </div>
        <figure className="card-review">
          <textarea
            // scrolls by default
            id={this.props.inputId}
            className="helvetica"
            type="text"
            placeholder="Translation"
            onKeyDown={this.onKeyDown}
            required
          />
        </figure>
        <div className="next-button">
          <button
            className="action-button helvetica white-fg green-bg"
            onClick={this.buttonOnClick}
          >
            Next
          </button>
        </div>
      </section>
    );
  }

  /*
   * Requests a card from the server.
   */
  requestCard() {
    // let request = new XMLHttpRequest();
    // request.open("GET", "/getcard", true);
    // request.onload = () => {
    //   let response = JSON.parse(request.responseText);
    //   this.setState({ card: response, flipped: false });
    // };
    // request.onerror = () => alert("There was an error requesting a card.");
    // request.send();
  }

  /*
   * Lazy name. Checks if the user input is correct.
   */
  correct() {
    const inputElement = document.getElementById(this.props.inputId);
    return (
      inputElement &&
      this.state.card &&
      this.state.card.translatedText == inputElement.value.trim()
    );
  }

  /*
   * Sends the answer result to the server.
   */
  sendResult() {
    let request = new XMLHttpRequest();
    request.open(
      "POST",
      `/putresult?unique_identifier=${
        this.state.card.unique_identifier
      }&result=${this.correct()}`,
      true
    );
    request.onload = () => undefined;
    request.onerror = () => alert("There was an error sending the result.");
    request.send();
  }

  /*
   * Flips the card and sends whether the user got the answer correct
   * to the server. Nothing happens if the card was already flipped.
   */
  maybeFlip() {
    if (!this.state.flipped) {
      this.setState({ flipped: true });
      this.sendResult();
    }
  }

  onKeyDown = event => {
    if (event.key == "Enter") {
      event.preventDefault();
      this.maybeFlip();
    }
  };

  cardOnClick = () => {
    this.maybeFlip();
  };

  buttonOnClick = () => {
    if (this.state.flipped) {
      this.requestCard();
    } else {
      alert("Flip the card first!");
    }
  };
}

///////////////////////////////////////////////////////////////////////////////
//                                   Final                                   //
///////////////////////////////////////////////////////////////////////////////
/*
 * Component for the entire creation screen.
 */
class MainScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = { reviewing: false };
    // this.state = { reviewing: true };
  }

  componentDidMount() {
    let request = new XMLHttpRequest();
    request.open("GET", "/hascard", true);

    request.onload = () => {
      let response = JSON.parse(request.responseText);
      this.setState({ reviewing: response.hasCard });
    };
    request.onerror = () => alert("There was an error contacting the server.");

    request.send();
  }

  render() {
    if (this.state.reviewing == undefined) {
      return <main />;
    }

    return (
      <main>
        <TitleBar
          buttonId={this.state.reviewing ? "add-button" : "review-button"}
          buttonText={this.state.reviewing ? "Add" : "Start Review"}
          buttonOnClick={this.buttonOnClick}
          paddingClass={
            this.state.reviewing
              ? "titlebar-review-padding"
              : "titlebar-add-padding"
          }
        />
        {this.state.reviewing ? (
          // textId isn't actually used anymore since we have the third-party component
          <ReviewCards textId="card-tl-review" inputId="card-en-review" />
        ) : (
          <CreationCards inputId="card-en-add" outputId="card-tl-add" />
        )}

        <UsernameBar username="Branny Buddy" />
      </main>
    );
  }

  buttonOnClick = () => {
    this.setState({ reviewing: !this.state.reviewing });
  };
}

ReactDOM.render(<MainScreen />, document.getElementById("root"));
