import React, { useState, useEffect } from "react";
// No axios needed, all in-browser
import styles from "./Piece3.module.css";

function SecretForm({
  onSubmit,
  loading,
  secret,
  setSecret,
  preposition,
  setPreposition,
  file,
  setFile,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={styles.piece3Form}
      encType="multipart/form-data"
    >
      <label className={styles.piece3Label}>
        Secrets
        <select
          value={preposition}
          onChange={(e) => setPreposition(e.target.value)}
          className={styles.piece3Select}
        >
          <option value="with">with</option>
          <option value="for">for</option>
          <option value="from">from</option>
        </select>
        &nbsp;you..
      </label>
      <input
        type="text"
        placeholder="?*/*^%#%$#@!$^&()(&%$@#$%^&?:"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        required
        className={styles.piece3Input}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className={styles.piece3File}
      />
      <button type="submit" disabled={loading} className={styles.piece3Button}>
        {loading ? "Submitting..." : "shh..."}
      </button>
    </form>
  );
}

const Piece3 = () => {
  const [secret, setSecret] = useState("");
  const [preposition, setPreposition] = useState("with");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [poem, setPoem] = useState(null);
  const [error, setError] = useState("");

  // No server fetch, just show the last submitted secret
  // Set poem directly in handleSubmit

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPoem({
          secret,
          preposition,
          image: event.target.result,
        });
        setSubmitted(true);
        setLoading(false);
        setSecret("");
        setFile(null);
      };
      reader.readAsDataURL(file);
    } else {
      setPoem({ secret, preposition, image: null });
      setSubmitted(true);
      setLoading(false);
      setSecret("");
      setFile(null);
    }
  };

  if (submitted && poem) {
    return (
      <div
        className={styles.piece3Poem}
        style={{
          backgroundImage: poem.image ? `url(${poem.image})` : undefined,
        }}
      >
        <div className={styles.piece3PoemContent}>
          <p>
            we've kept a secret <em>{poem.preposition}</em> each other
          </p>
          <p>
            you've kept a secret <em>{poem.preposition}</em> me
            <br />
            you hold it, i know you do.
            <br />
            we'll never speak again, not like we used to.
          </p>
          <p>
            i've kept a secret <em>{poem.preposition}</em> you.
            <br />
            nothing said out loud.
            <br />
            i'll tell you now. because,
            <br />
            we'll never speak again, not like we used to.
          </p>
          <p style={{ fontStyle: "italic", margin: "20px 0" }}>{poem.secret}</p>
          <p>
            you can take it, this thing i've shared…
            <br />
            that, the love, and the care.
          </p>
        </div>
        {/* Back to form button removed: users cannot submit again during a session */}
      </div>
    );
  }

  return (
    <div className={styles.piece3Container}>
      <SecretForm
        onSubmit={handleSubmit}
        loading={loading}
        secret={secret}
        setSecret={setSecret}
        preposition={preposition}
        setPreposition={setPreposition}
        file={file}
        setFile={setFile}
      />
      {error && <div className={styles.piece3Error}>{error}</div>}
    </div>
  );
};

export default Piece3;
