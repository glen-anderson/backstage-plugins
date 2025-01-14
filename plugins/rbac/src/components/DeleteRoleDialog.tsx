import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  TextField,
  Theme,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import { Alert } from '@material-ui/lab';

import { rbacApiRef } from '../api/RBACBackendClient';
import { getMembers } from '../utils/rbac-utils';
import { useToast } from './ToastContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }),
);

type DeleteRoleDialogProps = {
  open: boolean;
  closeDialog: () => void;
  roleName: string;
  propOptions: {
    memberRefs: string[];
    permissions: number;
  };
};

const DeleteRoleDialog = ({
  open,
  closeDialog,
  roleName,
  propOptions,
}: DeleteRoleDialogProps) => {
  const classes = useStyles();
  const { setToastMessage } = useToast();
  const [deleteRoleValue, setDeleteRoleValue] = React.useState<string>();
  const [disableDelete, setDisableDelete] = React.useState(false);
  const [error, setError] = React.useState<string | {}>('');

  const rbacApi = useApi(rbacApiRef);

  const deleteRole = async () => {
    try {
      const response = await rbacApi.deleteRole(roleName);
      if (response.status === 200 || response.status === 204) {
        setToastMessage(`Role ${roleName} deleted successfully`);
        closeDialog();
      } else {
        setError(response.statusText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `${err}`);
    }
  };

  const onTextInput = (value: string) => {
    setDeleteRoleValue(value);
    if (value === '') {
      setDisableDelete(true);
    } else if (value === roleName) {
      setDisableDelete(false);
    } else {
      setDisableDelete(true);
    }
  };

  return (
    <Dialog maxWidth="md" open={open} onClose={closeDialog}>
      <DialogTitle id="delete-role" title="Delete Role">
        <Box className={classes.titleContainer}>
          <span style={{ fontWeight: 'bold' }}>
            <ErrorIcon
              style={{
                color: 'red',
                alignContent: 'center',
                marginTop: '7px',
                marginBottom: '-3px',
              }}
              fontSize="small"
            />{' '}
            Delete this role?
          </span>

          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={closeDialog}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        Are you sure you want to delete the role{' '}
        <span style={{ fontWeight: 'bold' }}>{roleName}</span> ?
        <br />
        <br />
        Deleting this role is irreversible and will remove its functionality
        from the system. Proceed with caution.
        <br />
        <br />
        The{' '}
        <span style={{ fontWeight: 'bold' }}>{`${getMembers(
          propOptions.memberRefs,
        ).toLowerCase()}`}</span>{' '}
        associated with this role will lose access to all the{' '}
        <span
          style={{ fontWeight: 'bold' }}
        >{`${propOptions.permissions} permission policies`}</span>{' '}
        specified in this role.
        <br />
        <br />
        <br />
        <TextField
          required
          data-testid="delete-name"
          variant="outlined"
          label="Role name"
          defaultValue={deleteRoleValue}
          helperText="Type the name of the role to confirm"
          onChange={({ target: { value } }) => onTextInput(value)}
          onBlur={({ target: { value } }) => onTextInput(value)}
        />
      </DialogContent>
      {error && (
        <Box maxWidth="650px" marginLeft="20px">
          <Alert severity="error">{`Unable to delete. ${error}`}</Alert>
        </Box>
      )}
      <DialogActions
        style={{
          paddingLeft: '25px',
          paddingBottom: '30px',
          justifyContent: 'left',
        }}
      >
        <Button
          variant="contained"
          style={
            disableDelete || !deleteRoleValue
              ? {}
              : { background: 'red', color: 'white' }
          }
          onClick={deleteRole}
          disabled={disableDelete || !deleteRoleValue}
        >
          Delete
        </Button>
        <Button variant="outlined" onClick={closeDialog}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRoleDialog;
