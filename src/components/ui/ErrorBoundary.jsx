import { Component } from "react";
import i18n from "../../i18n";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("React error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="section page">
        <div className="container narrow center">
          <h1>{i18n.t("errors.title")}</h1>
          <p>{i18n.t("errors.text")}</p>
          <button type="button" className="btn btn--primary" onClick={() => window.location.assign("/")}>
            {i18n.t("errors.reload")}
          </button>
        </div>
      </section>
    );
  }
}
