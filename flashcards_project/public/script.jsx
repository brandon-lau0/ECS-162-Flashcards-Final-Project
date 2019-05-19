///////////////////////////////////////////////////////////////////////////////
//                               Add Card Page                               //
///////////////////////////////////////////////////////////////////////////////
/*
 * Requests the translation of TEXT, then calls CALLBACK with the
 * translation as the sole parameter.
 */
function requestTranslation(text, callback) {
  let request = new XMLHttpRequest();
  request.open("GET", `translate?english=${text}`, true);

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
  request.open("POST", `store?english=${en}&chinese=${tl}`, true);

  request.onerror = () => alert("There was an error with saving the card.");

  request.send();
}

/*
 * Component for the top part of the screen (title + review button).
 * No updates needed for this one.
 */
class CreationTitle extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section className="title-add">
        <div className="title-add-format">
          <button
            id="review-button"
            className="helvetica white-fg dark-purple-bg"
            onClick={this.onClick}
          >
            Start Review
          </button>
        </div>
        <h3 className="raleway dark-purple-fg">Lango!</h3>
        <div className="title-add-format" />
      </section>
    );
  }

  onClick = () => {
    alert("not implemented");
  };
}

/*
 * Component for the English input and translation output cards.
 */
class CreationCards extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tlText: undefined };
  }

  render() {
    const inputElement = document.getElementById(this.props.inputId);
    const input = inputElement && inputElement.value;
    // show grey if no input
    const tlColor = input && this.state.tlText ? "black-fg" : "grey-fg";

    return (
      <section className="card-add">
        <figure className="card-add">
          <textarea
            id={this.props.inputId}
            className="helvetica"
            type="text"
            placeholder="English"
            onKeyPress={this.onKeyPress}
          />
        </figure>
        <figure className="card-add">
          <span id={this.props.outputId} className={`helvetica ${tlColor}`}>
            {this.state.tlText || "Translation"}
          </span>
        </figure>
      </section>
    );
  }

  /*
   * Watches for when the user presses RET and makes the translation
   * request accordingly.
   */
  onKeyPress = event => {
    console.log(event);

    if (event.key == "Enter") {
      const input = document.getElementById(this.props.inputId).value;

      event.preventDefault();
      // TODO: revert this if not testing
      // requestTranslation(input, translation => {
      //   console.log(`${input}\n${translation}`);
      //   this.setState({ tlText: translation, translated: true });
      // });
      this.setState({ tlText: input });
    }
  };
}

/*
 * Component for the save button. Might be overkill.
 */
class SaveButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <button
        className="save-button helvetica white-fg green-bg"
        onClick={this.onClick}
      >
        Save
      </button>
    );
  }

  /*
   * Makes a request to save the card.
   */
  onClick = () => {
    console.log(this.props);
    const en = document.getElementById(this.props.inputId).value;
    const tl = document.getElementById(this.props.outputId).innerText;

    saveCard(en, tl);
  };
}

/*
 * Component for the username bar at the bottom.
 * This is actually used in more than one view, so it could be moved
 * somewhere else later.
 */
class UsernameBar extends React.Component {
  // PROPS should include the username
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <aside className="user-add helvetica white-fg dark-purple-bg">
        <div>{this.props.username}</div>
      </aside>
    );
  }
}

/*
 * Component for the entire creation screen.
 */
class CreationScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <main>
        <CreationTitle />
        <CreationCards inputId="card-en-add" outputId="card-tl-add" />

        <div className="save-button">
          <SaveButton inputId="card-en-add" outputId="card-tl-add" />
        </div>
        <UsernameBar />
      </main>
    );
  }
}

ReactDOM.render(<CreationScreen />, document.getElementById("root"));
