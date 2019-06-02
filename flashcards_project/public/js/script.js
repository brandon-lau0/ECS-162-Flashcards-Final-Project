var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

///////////////////////////////////////////////////////////////////////////////
//                                   Common                                  //
///////////////////////////////////////////////////////////////////////////////
var TopButton = function (_React$Component) {
  _inherits(TopButton, _React$Component);

  // PROPS should contain the button text and an onClick function
  function TopButton(props) {
    _classCallCheck(this, TopButton);

    return _possibleConstructorReturn(this, (TopButton.__proto__ || Object.getPrototypeOf(TopButton)).call(this, props));
  }

  _createClass(TopButton, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "button",
        {
          id: "top-button",
          className: "helvetica white-fg dark-purple-bg",
          onClick: this.props.onClick
        },
        this.props.text
      );
    }
  }]);

  return TopButton;
}(React.Component);

/*
 * Component for the top part of the screen (title + button).
 * No updates needed for this one.
 */


var TitleBar = function (_React$Component2) {
  _inherits(TitleBar, _React$Component2);

  // PROPS should contain buttonText, onClick, and horizontal padding class
  function TitleBar(props) {
    _classCallCheck(this, TitleBar);

    return _possibleConstructorReturn(this, (TitleBar.__proto__ || Object.getPrototypeOf(TitleBar)).call(this, props));
  }

  _createClass(TitleBar, [{
    key: "render",
    value: function render() {
      return (
        // since the padding changes between views
        React.createElement(
          "section",
          { className: "titlebar " + this.props.paddingClass },
          React.createElement(
            "div",
            { className: "titlebar-format" },
            React.createElement(TopButton, {
              text: this.props.buttonText,
              onClick: this.props.buttonOnClick
            })
          ),
          React.createElement(
            "h3",
            { className: "raleway dark-purple-fg" },
            "Lango!"
          ),
          React.createElement("div", { className: "titlebar-format" })
        )
      );
    }
  }]);

  return TitleBar;
}(React.Component);

/*
 * Component for the username bar at the bottom.
 */


var UsernameBar = function (_React$Component3) {
  _inherits(UsernameBar, _React$Component3);

  function UsernameBar(props) {
    _classCallCheck(this, UsernameBar);

    var _this3 = _possibleConstructorReturn(this, (UsernameBar.__proto__ || Object.getPrototypeOf(UsernameBar)).call(this, props));

    _this3.state = { username: "Username" };
    // I really don't like having this in the constructor,
    // but it's the simplest way.
    _this3.queryUsername();
    return _this3;
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
          this.state.username
        )
      );
    }
  }, {
    key: "queryUsername",
    value: function queryUsername() {
      var _this4 = this;

      var request = new XMLHttpRequest();
      request.open("GET", "username", true);

      request.onload = function () {
        var response = JSON.parse(request.responseText);
        _this4.setState({ username: response.username });
      };

      request.onerror = function () {
        alert("There was an error with requesting user information.");
      };

      request.send();
    }
  }]);

  return UsernameBar;
}(React.Component);

///////////////////////////////////////////////////////////////////////////////
//                               Addition Page                                //
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
 * Component for the English input and translation output cards with
 * button. Two items in one component.
 *
 * We could've extracted the button into a separate component, but
 * I decided it would be too much effort, even though that would give
 * us less React/CSS duplication and cleaner code.
 */

var CreationCards = function (_React$Component4) {
  _inherits(CreationCards, _React$Component4);

  function CreationCards(props) {
    _classCallCheck(this, CreationCards);

    var _this5 = _possibleConstructorReturn(this, (CreationCards.__proto__ || Object.getPrototypeOf(CreationCards)).call(this, props));

    _this5.onKeyDown = function (event) {
      if (event.key == "Enter") {
        var input = document.getElementById(_this5.props.inputId).value;

        event.preventDefault();
        requestTranslation(input, function (translation) {
          console.log(input + "\n" + translation);
          _this5.setState({ tlText: translation });
        });
      }
    };

    _this5.onKeyUp = function (_) {
      _this5.setState({ inputStyle: _this5.inputStyle() });

      // it's okay to modify value, since it's not managed by react
      if (document.getElementById(_this5.props.inputId).value == "") {
        _this5.setState({ tlText: "" });
      }
    };

    _this5.onClick = function () {
      console.log(_this5.props);
      var en = document.getElementById(_this5.props.inputId).value;
      var tl = document.getElementById(_this5.props.outputId).innerText;

      saveCard(en, tl);

      document.getElementById(_this5.props.inputId).value = "";
      _this5.setState({ tlText: "" });
    };

    _this5.state = { inputStyle: _this5.inputStyle(), tlText: undefined };
    return _this5;
  }

  _createClass(CreationCards, [{
    key: "render",
    value: function render() {
      var inputElement = document.getElementById(this.props.inputId);
      var input = inputElement && inputElement.value;
      // show grey if no input
      var tlColor = input && this.state.tlText ? "black-fg" : "grey-fg";

      return [
      // we could've used a wrapper instead of an array, but it's too late now
      React.createElement(
        "section",
        { key: "0", className: "card-add" },
        React.createElement(
          "figure",
          { className: "card-add" },
          React.createElement("textarea", {
            id: this.props.inputId,
            className: "helvetica",
            type: "text",
            placeholder: "English",
            onKeyDown: this.onKeyDown,
            onKeyUp: this.onKeyUp,
            style: this.state.inputStyle
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
      ), React.createElement(
        "div",
        { key: "1", className: "save-button" },
        React.createElement(
          "button",
          {
            className: "action-button helvetica white-fg green-bg",
            onClick: this.onClick
          },
          "Save"
        )
      )];
    }

    /*
     * Generates the inline styling for the input text.
     */

  }, {
    key: "inputStyle",
    value: function inputStyle() {
      var inputElement = document.getElementById(this.props.inputId);
      var inputStyle = { boxSizing: "border-box" };
      var dummy = void 0;

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


    /*
     * Watches for a key press and resizes the input box accordingly.
     */


    /*
     * Makes a request to save the card.
     */

  }]);

  return CreationCards;
}(React.Component);

///////////////////////////////////////////////////////////////////////////////
//                                Review Page                                //
///////////////////////////////////////////////////////////////////////////////
// import { FlipCard } from "./flip-card.jsx";
// TODO is above jsx or js?

/*
 * Component for review cards + button.
 * TODO flip card on enter
 */


var ReviewCards = function (_React$Component5) {
  _inherits(ReviewCards, _React$Component5);

  // PROPS should contain textId and inputId
  function ReviewCards(props) {
    _classCallCheck(this, ReviewCards);

    var _this6 = _possibleConstructorReturn(this, (ReviewCards.__proto__ || Object.getPrototypeOf(ReviewCards)).call(this, props));

    _this6.onKeyDown = function (event) {
      if (event.key == "Enter") {
        var input = document.getElementById(_this6.props.inputId).value;

        event.preventDefault();

        // TODO
      }
    };

    _this6.state = { card: undefined };
    return _this6;
  }

  _createClass(ReviewCards, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "section",
        { className: "card-review" },
        React.createElement(
          "figure",
          { className: "card-review" },
          React.createElement(
            "span",
            { id: this.props.textId },
            this.state.card ? this.state.card.chinese : "Loading..."
          )
        ),
        React.createElement(
          "figure",
          { className: "card-review" },
          React.createElement("textarea", {
            // scrolls by default
            id: this.props.inputId,
            className: "helvetica",
            type: "text",
            placeholder: "Translation",
            onKeyDown: this.onKeyDown
          })
        ),
        React.createElement(
          "div",
          { className: "next-button" },
          React.createElement(
            "button",
            {
              className: "action-button helvetica white-fg green-bg",
              onClick: this.onClick
            },
            "Next"
          )
        )
      );
    }

    /*
     * Requests a card from the server.
     */

  }, {
    key: "requestCard",
    value: function requestCard() {
      var _this7 = this;

      var request = new XMLHttpRequest();
      // TODO change url if branny & andy use a different one
      request.open("GET", "/card", true);
      request.onload = function () {
        var response = JSON.parse(request.responseText);
        _this7.setState({ card: response });
      };
      request.onerror = function () {
        return alert("There was an error requesting a card.");
      };
      request.send();
    }
  }]);

  return ReviewCards;
}(React.Component);

///////////////////////////////////////////////////////////////////////////////
//                                   Final                                   //
///////////////////////////////////////////////////////////////////////////////
/*
 * Component for the entire creation screen.
 */


var MainScreen = function (_React$Component6) {
  _inherits(MainScreen, _React$Component6);

  function MainScreen(props) {
    _classCallCheck(this, MainScreen);

    var _this8 = _possibleConstructorReturn(this, (MainScreen.__proto__ || Object.getPrototypeOf(MainScreen)).call(this, props));

    _this8.buttonOnClick = function () {
      _this8.setState({ reviewing: !_this8.state.reviewing });
    };

    _this8.state = { reviewing: false };
    return _this8;
  }

  _createClass(MainScreen, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "main",
        null,
        React.createElement(TitleBar, {
          buttonText: this.state.reviewing ? "Add" : "Start Review",
          buttonOnClick: this.buttonOnClick,
          paddingClass: this.state.reviewing ? "titlebar-review-padding" : "titlebar-add-padding"
        }),
        this.state.reviewing ? React.createElement(ReviewCards, { textId: "card-tl-review", inputId: "card-en-review" }) : React.createElement(CreationCards, { inputId: "card-en-add", outputId: "card-tl-add" }),
        React.createElement(UsernameBar, { username: "Branny Buddy" })
      );
    }
  }]);

  return MainScreen;
}(React.Component);

ReactDOM.render(React.createElement(MainScreen, null), document.getElementById("root"));

// TODO card style can be generalized