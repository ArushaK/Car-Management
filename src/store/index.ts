import { configureStore } from '@reduxjs/toolkit';
import configuratorReducer from './actions/configuratorSlice';
import carColorReducer from './actions/carColorSlice';
import notificationReducer from './actions/notificationSlice';
import cameraViewReducer from './actions/cameraViewSlice';
import selectionReducer from './actions/selectionSlice';
import decalToolsReducer from './actions/decalToolsSlice';
import teamSelectionReducer from './actions/teamSelectionSlice';
import meshToolsReducer from './actions/meshToolsSlice';
import visibilityReducer from './actions/visibilitySlice';

const store = configureStore({
  reducer: {
    configurator: configuratorReducer,
    carColor: carColorReducer,
    notification: notificationReducer,
    cameraView: cameraViewReducer,
    selection: selectionReducer,
    decalTools: decalToolsReducer,
    teamSelection: teamSelectionReducer,
    meshTools: meshToolsReducer,
    visibility: visibilityReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;