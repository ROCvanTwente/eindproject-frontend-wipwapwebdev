import { render, screen } from '@testing-library/react';
import App from './App';

test('renders rondleiding heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /rondleiding roc van twente/i });
  expect(heading).toBeInTheDocument();
});
