var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

///////////////////////////////////////////////////////////////////////////////
//                               Add Card Page                               //
///////////////////////////////////////////////////////////////////////////////
/*
 * Requests the translation of TEXT, then calls CALLBACK with the
 * translation as the sole parameter.
 */
function requestTranslation(text, callback) {
  var request = new XMLHttpRequest();
  request.open("GET", "translate?english=" + text, true);

  request.onload = function () {
    return callback(JSON.parse(request.responseText).Chinese);
  };
  request.onerror = function () {
    return alert("There was an error with the translation request.");
  };

  request.send();
}

/*
 * Requests to save a card with EN English text and TL translation
 * text to the database.
 */
function saveCard(en, tl) {
  var request = new XMLHttpRequest();
  request.open("POST", "store?english=" + en + "&chinese=" + tl, true);

  request.onerror = function () {
    return alert("There was an error with saving the card.");
  };

  request.send();
}

/*
 * Component for the top part of the screen (title + review button).
 * No updates needed for this one.
 */

var CreationTitle = function (_React$Component) {
  _inherits(CreationTitle, _React$Component);

  function CreationTitle(props) {
    _classCallCheck(this, CreationTitle);

    var _this = _possibleConstructorReturn(this, (CreationTitle.__proto__ || Object.getPrototypeOf(CreationTitle)).call(this, props));

    _this.onClick = function () {
      alert("not implemented");
    };

    return _this;
  }

  _createClass(CreationTitle, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "section",
        { className: "title-add" },
        React.createElement(
          "div",
          { className: "title-add-format" },
          React.createElement(
            "button",
            {
              id: "review-button",
              className: "helvetica white-fg dark-purple-bg",
              onClick: this.onClick
            },
            "Start Review"
          )
        ),
        React.createElement(
          "h3",
          { className: "raleway dark-purple-fg" },
          "Lango!"
        ),
        React.createElement("div", { className: "title-add-format" })
      );
    }
  }]);

  return CreationTitle;
}(React.Component);

/*
 * Component for the English input and translation output cards.
 */


var CreationCards = function (_React$Component2) {
  _inherits(CreationCards, _React$Component2);

  function CreationCards(props) {
    _classCallCheck(this, CreationCards);

    var _this2 = _possibleConstructorReturn(this, (CreationCards.__proto__ || Object.getPrototypeOf(CreationCards)).call(this, props));

    _this2.onKeyPress = function (event) {
      console.log(event);

      if (event.key == "Enter") {
        var input = document.getElementById(_this2.props.inputId).value;

        event.preventDefault();
        // TODO: revert this if not testing
        // requestTranslation(input, translation => {
        //   console.log(`${input}\n${translation}`);
        //   this.setState({ tlText: translation, translated: true });
        // });
        _this2.setState({ tlText: input });
      }
    };

    _this2.state = { tlText: undefined };
    return _this2;
  }

  _createClass(CreationCards, [{
    key: "render",
    value: function render() {
      var inputElement = document.getElementById(this.props.inputId);
      var input = inputElement && inputElement.value;
      // show grey if no input
      var tlColor = input && this.state.tlText ? "black-fg" : "grey-fg";

      return React.createElement(
        "section",
        { className: "card-add" },
        React.createElement(
          "figure",
          { className: "card-add" },
          React.createElement("textarea", {
            id: this.props.inputId,
            className: "helvetica",
            type: "text",
            placeholder: "English",
            onKeyPress: this.onKeyPress
          })
        ),
        React.createElement(
          "figure",
          { className: "card-add" },
          React.createElement(
            "span",
            { id: this.props.outputId, className: "helvetica " + tlColor },
            this.state.tlText || "Translation"
          )
        )
      );
    }

    /*
     * Watches for when the user presses RET and makes the translation
     * request accordingly.
     */

  }]);

  return CreationCards;
}(React.Component);

/*
 * Component for the save button. Might be overkill.
 */


var SaveButton = function (_React$Component3) {
  _inherits(SaveButton, _React$Component3);

  function SaveButton(props) {
    _classCallCheck(this, SaveButton);

    var _this3 = _possibleConstructorReturn(this, (SaveButton.__proto__ || Object.getPrototypeOf(SaveButton)).call(this, props));

    _this3.onClick = function () {
      console.log(_this3.props);
      var en = document.getElementById(_this3.props.inputId).value;
      var tl = document.getElementById(_this3.props.outputId).innerText;

      saveCard(en, tl);
    };

    return _this3;
  }

  _createClass(SaveButton, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "button",
        {
          className: "save-button helvetica white-fg green-bg",
          onClick: this.onClick
        },
        "Save"
      );
    }

    /*
     * Makes a request to save the card.
     */

  }]);

  return SaveButton;
}(React.Component);

/*
 * Component for the username bar at the bottom.
 * This is actually used in more than one view, so it could be moved
 * somewhere else later.
 */


var UsernameBar = function (_React$Component4) {
  _inherits(UsernameBar, _React$Component4);

  // PROPS should include the username
  function UsernameBar(props) {
    _classCallCheck(this, UsernameBar);

    return _possibleConstructorReturn(this, (UsernameBar.__proto__ || Object.getPrototypeOf(UsernameBar)).call(this, props));
  }

  _createClass(UsernameBar, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "aside",
        { className: "user-add helvetica white-fg dark-purple-bg" },
        React.createElement(
          "div",
          null,
          this.props.username
        )
      );
    }
  }]);

  return UsernameBar;
}(React.Component);

/*
 * Component for the entire creation screen.
 */


var CreationScreen = function (_React$Component5) {
  _inherits(CreationScreen, _React$Component5);

  function CreationScreen(props) {
    _classCallCheck(this, CreationScreen);

    return _possibleConstructorReturn(this, (CreationScreen.__proto__ || Object.getPrototypeOf(CreationScreen)).call(this, props));
  }

  _createClass(CreationScreen, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "main",
        null,
        React.createElement(CreationTitle, null),
        React.createElement(CreationCards, { inputId: "card-en-add", outputId: "card-tl-add" }),
        React.createElement(
          "div",
          { className: "save-button" },
          React.createElement(SaveButton, { inputId: "card-en-add", outputId: "card-tl-add" })
        ),
        React.createElement(UsernameBar, null)
      );
    }
  }]);

  return CreationScreen;
}(React.Component);

ReactDOM.render(React.createElement(CreationScreen, null), document.getElementById("root"));