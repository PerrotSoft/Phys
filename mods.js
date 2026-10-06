// mods.js — публичный API для модов «Физической песочницы».
// Этот файл специально оставлен простым и читаемым: сюда смотрят авторы модов.
//
// Мод — это обычный <script>, подключённый ПОСЛЕ engine.js, который вызывает
// window.ModSystem.registerMod({...}).
//
// Пример простого мода (например, mymod.js):
//
//   window.ModSystem.registerMod({
//     id: 'my-neon-mod',
//     name: 'Неоновые краски',
//     onReady(api) {
//       // api даёт доступ к движку: добавление материалов, палитра и т.д.
//       api.addMaterial({
//         symbol: 'Ne+',
//         name: 'Неон-плюс',
//         group: 'Моды',
//         density: 0.2, meltK: 10, boilK: 30,
//         color: [255, 0, 180],
//         atomRadiusPm: 40
//       });
//     },
//     onStep(api) {
//       // вызывается на каждом шаге симуляции (не обязателен)
//     },
//     onRender(api, ctx) {
//       // вызывается после отрисовки кадра — можно рисовать поверх (не обязателен)
//     }
//   });

(function () {
  const registeredMods = [];
  let engineApi = null; // выставляется движком через ModSystem._setApi(...)

  const ModSystem = {
    // --- API для модов ---

    // Зарегистрировать мод. Можно вызывать в любой момент, даже до того,
    // как движок готов — onReady будет вызван сразу, когда он появится.
    registerMod(mod) {
      if (!mod || typeof mod.id !== 'string') {
        console.error('[ModSystem] У мода должен быть строковый id');
        return;
      }
      if (registeredMods.some(m => m.id === mod.id)) {
        console.warn('[ModSystem] Мод с id "' + mod.id + '" уже зарегистрирован, пропускаю');
        return;
      }
      registeredMods.push(mod);
      console.log('[ModSystem] Зарегистрирован мод: ' + (mod.name || mod.id));
      if (engineApi && typeof mod.onReady === 'function') {
        try { mod.onReady(engineApi); } catch (e) { console.error('[ModSystem] Ошибка в onReady мода "' + mod.id + '"', e); }
      }
    },

    // Список всех зарегистрированных модов (копия, снаружи её нельзя мутировать напрямую)
    getMods() {
      return registeredMods.slice();
    },

    // --- Служебное, вызывается движком (engine.js), не модами ---

    _setApi(api) {
      engineApi = api;
      registeredMods.forEach(mod => {
        if (typeof mod.onReady === 'function') {
          try { mod.onReady(engineApi); } catch (e) { console.error('[ModSystem] Ошибка в onReady мода "' + mod.id + '"', e); }
        }
      });
    },

    _runStep() {
      registeredMods.forEach(mod => {
        if (typeof mod.onStep === 'function') {
          try { mod.onStep(engineApi); } catch (e) { console.error('[ModSystem] Ошибка в onStep мода "' + mod.id + '"', e); }
        }
      });
    },

    _runRender(ctx) {
      registeredMods.forEach(mod => {
        if (typeof mod.onRender === 'function') {
          try { mod.onRender(engineApi, ctx); } catch (e) { console.error('[ModSystem] Ошибка в onRender мода "' + mod.id + '"', e); }
        }
      });
    }
  };

  window.ModSystem = ModSystem;
})();
