import { render, screen } from '@testing-library/react';
import App from './App';

test('renders rondleiding heading', () => {
  render(<App />);
  const heading = screen.getByText(/rondleiding roc van twente/i);
  expect(heading).toBeInTheDocument();
});
