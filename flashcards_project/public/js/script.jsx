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
        id="top-button"
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
  // PROPS should contain buttonText and onClick
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section className="title-add">
        <div className="title-add-format">
          <TopButton
            text={this.props.buttonText}
            onClick={this.props.onClick}
          />
        </div>
        <h3 className="raleway dark-purple-fg">Lango!</h3>
        <div className="title-add-format" />
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
    // I really don't like having this in the constructor,
    // but it's the simplest way.
    this.queryUsername();
  }

  render() {
    return (
      <aside className="user-add helvetica white-fg dark-purple-bg">
        <div>{this.state.username}</div>
      </aside>
    );
  }

  queryUsername() {
    let request = new XMLHttpRequest();
    request.open("GET", "username", true);

    request.onload = () => {
      let response = JSON.parse(request.responseText);
      this.setState({ username: response.username });
    };

    request.onerror = () => {
      alert("There was an error with requesting user information.");
    };

    request.send();
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
 * Component for the English input and translation output cards with
 * button. Two items in one component
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
          className="save-button helvetica white-fg green-bg"
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
      requestTranslation(input, translation => {
        console.log(`${input}\n${translation}`);
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

    saveCard(en, tl);

    document.getElementById(this.props.inputId).value = "";
    this.setState({ tlText: "" });
  };
}

///////////////////////////////////////////////////////////////////////////////
//                                   Final                                   //
///////////////////////////////////////////////////////////////////////////////
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
        <TitleBar buttonText="Start Review" />
        <CreationCards inputId="card-en-add" outputId="card-tl-add" />
        <UsernameBar username="Branny Buddy" />
      </main>
    );
  }
}

ReactDOM.render(<CreationScreen />, document.getElementById("root"));
