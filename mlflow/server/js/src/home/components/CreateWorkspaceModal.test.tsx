import { describe, jest, beforeEach, test, expect } from '@jest/globals';
import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { renderWithIntl, screen } from '@mlflow/mlflow/src/common/utils/TestUtils.react18';

jest.mock('../../common/utils/FetchUtils');

describe('CreateWorkspaceModal', () => {
  const mockOnClose = jest.fn();
  const mockOnWorkspaceCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (isOpen = true) => {
    return renderWithIntl(
      <CreateWorkspaceModal isOpen={isOpen} onClose={mockOnClose} onWorkspaceCreated={mockOnWorkspaceCreated} />,
    );
  };

  test('renders modal when open', () => {
    renderComponent(true);
    expect(screen.getByText('Create Workspace')).toBeInTheDocument();
    expect(screen.getByText('Workspace Name')).toBeInTheDocument();
    expect(screen.getByText('Description (optional)')).toBeInTheDocument();
  });

  test('does not render modal when closed', () => {
    renderComponent(false);
    expect(screen.queryByText('Create Workspace')).not.toBeInTheDocument();
  });

  test('renders input fields with correct placeholders', () => {
    renderComponent();

    expect(screen.getByPlaceholderText('Enter workspace name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter workspace description')).toBeInTheDocument();
  });

  test('renders Create button', () => {
    renderComponent();

    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  test('allows typing in workspace name field', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    await user.type(nameInput, 'my-workspace');

    expect(nameInput).toHaveValue('my-workspace');
  });

  test('allows typing in description field', async () => {
    const user = userEvent.setup();
    renderComponent();

    const descInput = screen.getByPlaceholderText('Enter workspace description');
    await user.type(descInput, 'My workspace description');

    expect(descInput).toHaveValue('My workspace description');
  });

  test('shows validation error when name is empty and form is submitted', async () => {
    const user = userEvent.setup();
    renderComponent();

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Please input a name for the new workspace.')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid workspace name with spaces', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    await user.type(nameInput, 'Invalid Name With Spaces');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Workspace name must be lowercase alphanumeric with optional single hyphens (no consecutive hyphens).',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows validation error for workspace name starting with hyphen', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    await user.type(nameInput, '-invalid');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Workspace name must be lowercase alphanumeric with optional single hyphens (no consecutive hyphens).',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows validation error for workspace name ending with hyphen', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    await user.type(nameInput, 'invalid-');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Workspace name must be lowercase alphanumeric with optional single hyphens (no consecutive hyphens).',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows validation error for workspace name with uppercase letters', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    await user.type(nameInput, 'InvalidName');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Workspace name must be lowercase alphanumeric with optional single hyphens (no consecutive hyphens).',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows validation error for workspace name with consecutive hyphens', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    await user.type(nameInput, 'my--workspace');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Workspace name must be lowercase alphanumeric with optional single hyphens (no consecutive hyphens).',
        ),
      ).toBeInTheDocument();
    });
  });

  test('shows validation error for reserved workspace name', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    await user.type(nameInput, 'api');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Workspace name 'api' is reserved and cannot be used.")).toBeInTheDocument();
    });
  });

  test('shows validation error for workspace name that is too short', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    await user.type(nameInput, 'a');

    const createButton = screen.getByText('Create');
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Workspace name must be between 2 and 63 characters.')).toBeInTheDocument();
    });
  });
});
