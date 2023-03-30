import Cookies from 'js-cookie';
import type { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import { TOKEN_COOKIE_NAME } from '../../lib/utils';

const EmailLoginForm: FunctionComponent<{}> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        fetch('http://localhost:8080/v1-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            // name: 'Arikko',
          }),
        }).then(async (res) => {
          const json = await res.json();
          if (res.status === 200) {
            Cookies.set(TOKEN_COOKIE_NAME, json.token);
            window.location.href = '/';
          } else {
            console.log('error', json);
          }
        });
      }}
    >
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm  outline-none transition duration-150 ease-in-out placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
        placeholder="Enter you email"
        value={email}
        onChange={(e) => setEmail(String((e.target as any).value))}
      />
      <label htmlFor="password" className="sr-only">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="mt-2 block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 shadow-sm  outline-none transition duration-150 ease-in-out placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
        placeholder="Enter you password"
        value={password}
        onChange={(e) => setPassword(String((e.target as any).value))}
      />
      <button
        type="submit"
        className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-black p-2 text-sm font-medium text-white outline-none transition duration-150 ease-in-out focus:ring-2 focus:ring-black focus:ring-offset-1 disabled:opacity-60"
      >
        Continue
      </button>
    </form>
  );
};

export default EmailLoginForm;
