/*
   This flipcard component is based on the flipcard component by
   Alex Devero, at:

      https://reactjsexample.com/react-flipping-card-with-tutorial/

   It was modified for ECS 162 by Nina Amenta, May 2019.

   Modified by Branny's buddy to work with the ECS162 final, June 2019.
*/

// React component for form inputs
export class CardInput extends React.Component {
  render() {
    return (
      <fieldset>
        <input
          name={this.props.name}
          id={this.props.id}
          type={this.props.type || "text"}
          placeholder={this.props.placeholder}
          required
        />
      </fieldset>
    );
  }
}

// React component for textarea
export class CardTextarea extends React.Component {
  // There's absolutely no point in using the given CardTextarea
  // because it's literally just a textarea. If anything, it'll
  // be a headache.
  render() {
    return (
      <fieldset>
        <textarea
          name={this.props.name}
          id={this.props.id}
          placeholder={this.props.placeholder}
          required
        />
      </fieldset>
    );
  }
}

// React component for the front side of the card
class CardFront extends React.Component {
  render(props) {
    return (
      <div className="card-side side-front">
        <div className="card-side-container">
          <h2 id="trans">{this.props.text}</h2>
        </div>
      </div>
    );
  }
}

// React component for the back side of the card
class CardBack extends React.Component {
  render(props) {
    return (
      <div className="card-side side-back">
        <div className="card-side-container">
          <h2 id="congrats">{this.props.text}</h2>
        </div>
      </div>
    );
  }
}

// React component for the card (main component)
export class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="card-container">
        <div className="card-body">
          <CardBack text={this.props.backText} />

          <CardFront text={this.props.frontText} />
        </div>
      </div>
    );
  }
}
